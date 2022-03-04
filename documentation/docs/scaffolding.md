---
sidebar_position: 2
---

# Scaffolding

In order to create and publish a new operator you can use `build_operator.sh` for that.
It requires to have at least 1 parameter, to specify which version you would like to release.
Make sure, that you provide the [SemVer](https://semver.org/) compatible version.

```yaml
./build_operator.sh 1.0.0
```

By default, it will push it to `docker.io/xldevdocker/deploy-operator:1.0.0`, but you can also choose another organization,
if you want to for example do some modifications or test it before pushing to `xldevdocker`.
For that you can provide a second parameter, for example:

```yaml
./build_operator.sh 2.1.3 acierto
```

then it will publish the operator to `docker.io/acierto/deploy-operator:2.1.3`

:::tip

You have to login to your docker account before executing the script!

`docker login`

:::
