const router = require('koa-router')();
// 总控制
const noneCtrl= (ctx,next)=>{
  
}
router.all('/api/*',noneCtrl)

module.exports = router