# meet-hcb

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build

rsync -rave 'ssh -i ~/.ssh/shennong.pem' ./dist/* root@47.244.36.158:/data/www/
```

### Run your tests

```
npm run test
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Plugin Support

插件形式调用 Vux 组件

- `Loading`

  `this.$vux.loading.show`

- `Alert`

  `this.$vux.alert`

## API