/*
用来定义路由的路由器模块
 */
const express = require('express')
const md5 = require('blueimp-md5')

const SchoolAdminModel = require('../models/SchoolAdminModel')
const SystemAdminModel = require('../models/SystemAdminModel')
const RoleModel = require('../models/RoleModel')



// 得到路由器对象
const router = express.Router()
// console.log('router', router)

// 指定需要过滤的属性
const filter = {password: 0, __v: 0}

// 登陆
router.post('/login', (req, res) => {
  const { username, password, admin_role } = req.body;
  console.log(username, password, admin_role);

  // 根据username和password查询数据库users, 如果没有, 返回提示错误的信息, 如果有, 返回登陆成功信息
  if(admin_role === '1'){
    SystemAdminModel.findOne({username, password: md5(password)})
    .then(systemadmin => {
      if (systemadmin) { // 登陆成功
        // 生成一个cookie(systemadminid: systemadmin._id), 并交给浏览器保存
        res.cookie('systemadminid', systemadmin._id, {maxAge: 1000 * 60 * 60 * 24})
        if (systemadmin.role_id) {
          RoleModel.findOne({_id: systemadmin.role_id})
            .then(role => {
              systemadmin._doc.role = role
              console.log('role user', systemadmin)
              res.send({status: 0, data: systemadmin})
            })
        } else {
          systemadmin._doc.role = {menus: []}
          // 返回登陆成功信息
          res.send({status: 0, data: systemadmin})
        }
      } else {// 登陆失败
        res.send({status: 1, msg: '用户名或密码不正确!'})
      }
    })
    .catch(error => {
      console.error('登陆异常', error)
      res.send({status: 1, msg: '登陆异常, 请重新尝试'})
    })
  }
  if(admin_role === '2'){
    console.log('SchoolAdminModel')
    SchoolAdminModel.findOne({username, password: md5(password)})
    .then(schooladmin => {
      if (schooladmin) { // 登陆成功
        // 生成一个cookie(userid: user._id), 并交给浏览器保存
        res.cookie('schooladminid', schooladmin._id, {maxAge: 1000 * 60 * 60 * 24})
        if (schooladmin.role_id) {
          RoleModel.findOne({_id: schooladmin.role_id})
            .then(role => {
              schooladmin._doc.role = role
              console.log('role user', schooladmin)
              res.send({status: 0, data: schooladmin})
            })
        } else {
          schooladmin._doc.role = {menus: []}
          // 返回登陆成功信息
          res.send({status: 0, data: schooladmin})
        }
      } else {// 登陆失败
        res.send({status: 1, msg: '用户名或密码不正确!'})
      }
    })
    .catch(error => {
      console.error('登陆异常', error)
      res.send({status: 1, msg: '登陆异常, 请重新尝试'})
    })
  }
})

// 添加学校管理员
router.post('/schooladmin_register', (req, res) => {
  // 读取请求参数数据
  console.log(req.body)
  const { username, password } = req.body
  // 处理: 判断是否已经存在, 如果存在, 返回提示错误的信息, 如果不存在, 保存
  // 查询(根据username)
  SchoolAdminModel.findOne({username})
    .then(schooladmin => {
      // 如果schooladmin有值(已存在)
      if (schooladmin) {
        // 返回提示错误的信息
        res.send({status: 1, msg: '此管理员账户已存在！'})
        return new Promise(() => {
        })
      } else { // 没值(不存在)
        // 保存
        return SchoolAdminModel.create({...req.body, password: md5(password)})
      }
    })
    .then(schooladmin => {
      // 返回包含schooladmin的json数据
      res.send({status: 0, data: schooladmin})
    })
    .catch(error => {
      console.error('注册异常', error)
      res.send({status: 1, msg: '添加学校管理员异常, 请重新尝试！'})
    })
})

require('./file-upload')(router)

module.exports = router