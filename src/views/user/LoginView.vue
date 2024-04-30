<template>
  <div class="loginBody">
    <div class="loginData">
      <el-form ref="form" :model="form" status-icon :rules="loginRules">
        <el-form-item>
          <div class="loginTitle">
            <h1>WelCome!</h1>
          </div>
        </el-form-item>
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user" v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-unlock" placeholder="请输入密码" v-model="form.password"
                    show-password></el-input>
        </el-form-item>
        <el-form-item prop="remember">
          <el-tooltip class="item" effect="dark" content="不建议勾选!" placement="left">
            <el-checkbox v-model="form.remember" style="float: left">记住密码</el-checkbox>
          </el-tooltip>
          <router-link to="/register" style="float: right">没有账号？立即注册</router-link>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%; font-size: large" @click="loginCheck('form')">登录</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger" style="width: 100%;font-size: large" @click="resetForm('form')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'LoginView',
  data() {
    //用户名校验
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('用户名不能为空！'));
      } else if (value.charAt(0) == ' ' || value.charAt(value.length - 1) == ' ') {
        callback(new Error('用户名前后不能有空格！'));
        // '用户名前后不能有空格！'
      } else {
        callback();
      }
    }
    //密码校验
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('密码最少为6位字符！'))
      } else if (value.charAt(0) == ' ' || value.charAt(value.length - 1) == ' ') {
        callback(new Error('密码前后不能有空格！'));
        // 密码前后不能有空格！'
      } else {
        callback()
      }
    }
    return {

      //服务器地址
      ip: 'http://10.62.192.125',

      form: {
        username: '',
        password: '',
        //是否保存密码
        remember: false
      },
      //表单校验规则
      loginRules: {
        username: [{required: true, trigger: 'blur', validator: validateUsername}],
        password: [{required: true, trigger: 'blur', validator: validatePassword}]
      },

    }
  },
  methods: {
    //重置表单
    resetForm(form) {
      this.$refs[form].resetFields();
    },

    //登录检查
    loginCheck(form) {
      this.$refs[form].validate((valid) => {
        if (valid) {
          this.login();
        } else {
          //console.log('error submit!!');
          return false;
        }
      });
    },

    //异步登录
    login() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //发送信息
      axios.post(this.ip + "/users", this.form)
          .then(res => {
            if (res.data.code == 40001) {
              //登录成功
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
              this.$router.back();
            } else {
              //登录失败
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
              //重置表单
              this.resetForm('form');
            }
          });
    },

    //检测有无记住登录的信息
    checkCookie() {
      this.form.username = this.getCookie("TieUsername");
      this.form.password = this.getCookie("TiePassword");
      //console.log(this.form);
    },

    //查询cookie指定字段名
    getCookie(name) {
      // 解析cookie字符串，查找名为 "name" 的cookie
      const cookies = document.cookie.split(';').map(cookie => cookie.trim());
      for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name) {
          return decodeURIComponent(cookieValue);
        }
      }
      return '';
    }
  },
  mounted() {
    this.checkCookie();
  }
}
</script>

<style>
.loginBody {
  width: 100%;
  height: 100%;
  min-width: 1000px;
  background-image: url("../../assets/imges/login_background4.jpg");
  background-size: cover;
  background-position: center center;
  overflow: auto;
  background-repeat: no-repeat;
  position: fixed;
  line-height: 100%;
  padding-top: 150px;
}

.loginData {
  width: 20%;
  transform: translate(-50%);
  margin-left: 50%;
}

.loginTitle {
  font-size: large;
  color: white;
  text-align: center;
  text-shadow: 2px 2px 4px #000000;
}
</style>