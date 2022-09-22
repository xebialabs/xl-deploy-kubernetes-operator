import com.github.gradle.node.yarn.task.YarnTask
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

buildscript {
    repositories {
        mavenLocal()
        gradlePluginPortal()
        arrayOf("releases", "public").forEach { r ->
            maven {
                url = uri("${project.property("nexusBaseUrl")}/repositories/${r}")
                credentials {
                    username = project.property("nexusUserName").toString()
                    password = project.property("nexusPassword").toString()
                }
            }
        }
    }

    dependencies {
        classpath("com.xebialabs.gradle.plugins:gradle-commit:${properties["gradleCommitPluginVersion"]}")
        classpath("com.xebialabs.gradle.plugins:gradle-xl-defaults-plugin:${properties["xlDefaultsPluginVersion"]}")
        classpath("com.xebialabs.gradle.plugins:gradle-xl-plugins-plugin:${properties["xlPluginsPluginVersion"]}")
        classpath("com.xebialabs.gradle.plugins:integration-server-gradle-plugin:${properties["integrationServerGradlePluginVersion"]}")
    }
}

plugins {
    kotlin("jvm") version "1.4.20"

    id("com.github.node-gradle.node") version "3.1.0"
    id("idea")
    id("nebula.release") version "15.3.1"
    id("maven-publish")
}

apply(plugin = "integration.server")
apply(plugin = "ai.digital.gradle-commit")
apply(plugin = "com.xebialabs.dependency")

group = "ai.digital.deploy.operator"
project.defaultTasks = listOf("build")

val releasedVersion = System.getenv()["RELEASE_EXPLICIT"] ?: "22.2.0-${
    LocalDateTime.now().format(DateTimeFormatter.ofPattern("Mdd.Hmm"))
}"
project.extra.set("releasedVersion", releasedVersion)

allprojects {
    repositories {
        mavenLocal()
        mavenCentral()
        arrayOf("releases", "public", "thirdparty").forEach { r ->
            maven {
                url = uri("${project.property("nexusBaseUrl")}/repositories/${r}")
                credentials {
                    username = project.property("nexusUserName").toString()
                    password = project.property("nexusPassword").toString()
                }
            }
        }
    }
}

idea {
    module {
        setDownloadJavadoc(true)
        setDownloadSources(true)
    }
}

dependencies {
    implementation(gradleApi())
    implementation(gradleKotlinDsl())

}

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}

tasks.named<Test>("test") {
    useJUnitPlatform()
}

val providers = listOf("aws-eks", "azure-aks", "gcp-gke", "onprem", "openshift")

fun toOperatorArchiveTaskName(providerName: String): String {
    return "operatorArchives${providerName.capitalize().replace("-", "")}"
}

fun toOperatorSyncTaskName(providerName: String): String {
    return "sync${providerName.capitalize().replace("-", "")}"
}

tasks {
    register("dumpVersion") {
        doLast {
            file(buildDir).mkdirs()
            file("$buildDir/version.dump").writeText("version=${releasedVersion}")
        }
    }

    named<YarnTask>("yarn_install") {
        args.set(listOf("--mutex", "network"))
        workingDir.set(file("${rootDir}/documentation"))
    }

    for (provider in providers) {
        register<Zip>(toOperatorArchiveTaskName(provider)) {
            from("deploy-operator-$provider") {
                include("**/*")
                archiveBaseName.set("deploy-operator-${provider}")
                archiveVersion.set(releasedVersion)
            }
        }
    }

    register<YarnTask>("yarnRunStart") {
        dependsOn(named("yarn_install"))
        args.set(listOf("run", "start"))
        workingDir.set(file("${rootDir}/documentation"))
    }

    register<YarnTask>("yarnRunBuild") {
        dependsOn(named("yarn_install"))
        args.set(listOf("run", "build"))
        workingDir.set(file("${rootDir}/documentation"))
    }

    register<Delete>("docCleanUp") {
        delete(file("${rootDir}/docs"))
        delete(file("${rootDir}/documentation/build"))
        delete(file("${rootDir}/documentation/.docusaurus"))
        delete(file("${rootDir}/documentation/node_modules"))
    }

    register<Copy>("docBuild") {
        dependsOn(named("yarnRunBuild"), named("docCleanUp"))
        from(file("${rootDir}/documentation/build"))
        into(file("${rootDir}/docs"))
    }

    register<GenerateDocumentation>("updateDocs") {
        dependsOn(named("docBuild"))
    }

    register<NebulaRelease>("nebulaRelease") {
        dependsOn(named("updateDocs"))
    }

    val syncTasks = mutableListOf<String>()

    for (provider in providers) {
        val taskName = toOperatorSyncTaskName(provider)
        syncTasks.add(taskName)
        register<Exec>(taskName) {
            dependsOn(toOperatorArchiveTaskName(provider))

            if (project.hasProperty("versionToSync")) {
                val versionToSync = project.property("versionToSync")
                val command =
                    "ssh xebialabs@nexus.xebialabs.com rsync --update -raz -i --include='*.zip' " +
                            "--exclude='*' /opt/sonatype-work/nexus/storage/releases/ai/digital/deploy/operator/deploy-operator-${provider}/$versionToSync/ " +
                            "xldown@dist.xebialabs.com:/var/www/dist.xebialabs.com/customer/operator/deploy"
                commandLine(command.split(" "))
            } else {
                commandLine("echo",
                    "You have to specify which version you want to sync, ex. ./gradlew syncToDistServer -PversionToSync=22.2.0")
            }
        }
    }

    register("syncToDistServer") {
        dependsOn(syncTasks)
    }

    named<Upload>("uploadArchives") {
        dependsOn(named("dumpVersion"))
        dependsOn(named("publish"))
    }

    register("buildOperators") {
        for (provider in providers) {
            dependsOn(toOperatorArchiveTaskName(provider))
        }
    }

    register("checkDependencyVersions") {
        // a placeholder to unify with release in jenkins-job
    }
}

publishing {
    publications {
        for (provider in providers) {
            register("operator-archive-$provider", MavenPublication::class) {
                artifact(tasks[toOperatorArchiveTaskName(provider)]) {
                    artifactId = "deploy-operator-$provider"
                    version = releasedVersion
                }
            }
        }
    }

    repositories {
        maven {
            url = uri("${project.property("nexusBaseUrl")}/repositories/releases")
            credentials {
                username = project.property("nexusUserName").toString()
                password = project.property("nexusPassword").toString()
            }
        }
    }
}

node {
    version.set("16.13.2")
    yarnVersion.set("1.22.17")
    download.set(true)
}
