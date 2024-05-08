<template>
  <!--注册页面-->
  <div class="loginBody">
    <div class="loginData">
      <el-form ref="form" :model="form" status-icon :rules="loginRules">
        <el-form-item>
          <div class="loginTitle">
            <h1>创建用户</h1>
          </div>
        </el-form-item>
        <el-form-item prop="username" label="用户名">
          <el-input v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input placeholder="请输入密码" v-model="form.password" show-password></el-input>
        </el-form-item>
        <el-form-item prop="repassword" label="确认密码">
          <el-input placeholder="请再次输入密码" v-model="form.repassword" show-password></el-input>
        </el-form-item>
        <el-form-item prop="gender">
          <span style="float: left; font-size: large">男</span>
          <el-switch v-model="form.gender"
                     inactive-value="男"
                     active-value="女"
                     inactive-color="#409EFF"
                     active-color="pink"
                     style="float: left"
          ></el-switch>
          <span style="float: left; font-size: large">女</span>
        </el-form-item>
        <el-form-item prop="userSignature" label="个性签名">
          <el-input
              type="textarea"
              :rows="2"
              placeholder="请输入个性签名"
              v-model="form.userSignature">
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%; font-size: large" @click="checkRegister('form')">创建
          </el-button>
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
  name: 'RegisterView',
  data() {
    //用户名校验
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('用户名不能为空！'));
      } else if (value.charAt(0) == ' ' || value.charAt(value.length - 1) == ' ') {
        callback(new Error('用户名前后不能有空格！'));
        // '用户名前后不能有空格！'
      } else if (value.length > 12){
        callback(new Error('用户名最多为12个字符！'));
      } else {
        //检查用户名是否存在
        var flag = true; //true表示用户名已存在
        //设置axios跨域访问时携带凭证
        axios.defaults.withCredentials = true;
        axios.get("http://10.62.192.125/users/" + this.form.username)
            .then(res => {
              if (res.data.code == 20001) {
                flag = res.data.data;
              }
              if (flag) {
                callback("用户名已存在！");
              } else {
                callback();
              }
            });
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
    //重复密码校验
    const validateRePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    }

    return {
      //服务器地址
      ip: 'http://10.62.192.125',

      form: {
        username: '',
        password: '',
        repassword: '',
        gender: '男',
        userSignature: '这个人很神秘，什么都没有写。。。。',
      },
      //表单校验规则
      loginRules: {
        username: [{required: true, trigger: 'blur', validator: validateUsername}],
        password: [{required: true, trigger: 'blur', validator: validatePassword}],
        repassword: [{required: true, trigger: 'blur', validator: validateRePassword}]
      },

    }
  },
  methods: {
    //重置表单
    resetForm(form) {
      this.$refs[form].resetFields();
    },
    //注册校验
    checkRegister(form) {
      //console.log(this.form);
      this.$refs[form].validate((valid) => {
        //校验信息
        if (valid) {
          this.register();
        } else {
          //console.log('error submit!!');
          return false;
        }
      });
    },



    //注册
    register() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.post(this.ip + "/users/register", this.form)
          .then(res => {
            if (res.data.code == 50001) {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
              this.$router.push('/login');
            } else {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
              this.resetForm('form');
            }
          });
    }
  },
  mounted() {

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
  padding-top: 50px;
}

.loginData {
  width: 25%;
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