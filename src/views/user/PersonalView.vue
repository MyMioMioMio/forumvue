<template>
  <el-container direction="vertical" style="height: 100%">
    <!--头部分-->
    <el-header>
      <el-menu
          class="el-menu-demo"
          mode="horizontal"
          @select="handleSelect"
          text-color="#409eff"
          active-text-color="#E6A23C"
          :default-active="$route.path"
          router
      >
        <el-menu-item index="/" style="font-size: xx-large">贴吧</el-menu-item>
        <el-menu-item>
          <el-button type="primary" plain @click="lastPage()">返回</el-button>
        </el-menu-item>
        <el-menu-item>
          <el-input placeholder="请输入内容" v-model="searchString">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-menu-item>

        <!--用户行为-->
        <el-menu-item style="float: right">
          <span>{{ user.username }}  </span>
          <el-dropdown @command="handleCommand">
            <el-avatar :size="50" :src="userPhotoSrc" :fit="fit"></el-avatar>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="loginFlag == true" command="/personal">个人页面</el-dropdown-item>
              <!--              <el-dropdown-item>登录</el-dropdown-item>-->
              <el-dropdown-item v-if="loginFlag == true" command="quitLogin">登出</el-dropdown-item>
              <el-dropdown-item v-if="loginFlag == false" command="/login">登录</el-dropdown-item>
              <el-dropdown-item v-if="loginFlag == false" command="/register">注册</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-menu-item>
      </el-menu>
    </el-header>
    <el-container>
      <!--侧边导航栏-->
      <el-aside width="12%" style="overflow: hidden">
        <el-menu
            :default-active="asideActive"
            class="el-menu-vertical-demo"
            router
        >
          <el-menu-item index="/personal">
            <i class="el-icon-user"></i>
            <span slot="title">个人信息</span>
          </el-menu-item>
          <el-menu-item index="/changePassword">
            <i class="el-icon-lock"></i>
            <span slot="title">修改密码</span>
          </el-menu-item>
          <el-menu-item index="/personalPost">
            <i class="el-icon-menu"></i>
            <span slot="title">我的贴子</span>
          </el-menu-item>
          <el-menu-item index="/personalChat">
            <i class="el-icon-chat-line-round"></i>
            <span slot="title">我的私信</span>
          </el-menu-item>
          <el-menu-item index="/setting">
            <i class="el-icon-setting"></i>
            <span slot="title">设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <!--体部分-->
        <el-main>
          <div style="float: left">
            <!--头像部分-->
            <el-upload
                class="avatar-uploader"
                action
                :http-request="upload"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload">
              <img v-if="photoSrc" :src="photoSrc" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <h1>设置头像</h1>
          </div>
        </el-main>
        <!--制作信息-->
        <el-footer>
          <span style="text-align: center; font-size: x-small; color: #99a9bf">制作byMyMioMioMio</span>
        </el-footer>
      </el-container>
    </el-container>
  </el-container>

</template>
<script>
import axios from "axios";

export default {
  data() {

    return {

      //用户头像地址
      userPhotoSrc: null,

      //回显图片地址
      photoSrc: null,

      //当前活跃页面
      asideActive: '/personal',

      //服务器地址
      ip: 'http://10.62.192.125',

      //图片样式为填充
      fit: "cover",

      //用户模型
      user: {},
      loginFlag: false,
      searchString: "",

    };
  },
  methods: {

    //上传头像的方法
    upload(item) {
      //设置表单
      let formData = new FormData();
      formData.append("file", item.file);
      formData.append("uid", this.user.uid);
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //上传头像
      axios.post(this.ip + "/users/uploadavatar", formData)
          .then(res => {
            if (res.data.code == 30001) {
              //上传成功
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
              //设置用户头像路径
              this.photoSrc = this.ip + "/users/download/" + this.user.uid;
            } else {
              //上传失败
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          });
    },

    //上传头像前的校验
    beforeAvatarUpload(file) {
      //判断文件类型
      const isTrueImg = file.type === 'image/jpeg' || file.type === 'image/png';
      //判断文件大小
      const isLt2M = file.size / 1024 / 1024 < 10;

      if (!isTrueImg) {
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!');
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 10MB!');
      }
      //this.imageUrl = URL.createObjectURL(file.raw);
      return isTrueImg && isLt2M;
    },

    //顶部导航栏
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },

    //返回上一页
    lastPage() {
      this.$router.back();
    },

    //处理下拉菜单
    handleCommand(command) {
      if (command == "quitLogin") {
        this.quitLogin();
      } else if (command != this.$route.path) {
        //判断条件可避免重复路由
        this.$router.push(command);
      }
    },

    //检查有无登录，并获取登录信息
    getUser() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //获取用户信息
      axios.get(this.ip + "/users")
          .then(res => {
            if (res.data.code == 20001) {
              //获取成功
              this.user = res.data.data;
              this.loginFlag = true;
              //获得头像地址
              this.userPhotoSrc = this.returnUserPhotoSrc(this.user.uid);
            } else {
              this.loginFlag = false;
            }
          });
    },

    //退出登录
    quitLogin() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //退出登录
      axios.get(this.ip + "/users/quitlogin")
          .then(res => {
            if (res.data.code == 60001) {
              //退出成功
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
              this.$router.go(0);
            }
          });
    },

    //返回用户头像路径
    returnUserPhotoSrc(uid) {
      return this.ip + "/users/download/" + uid;
    }
  },
  //页面加载完成时执行的方法
  mounted() {
    this.getUser();
  }
}
</script>

<style>
html,
body,
#app,
.el-container {
  margin: 0;
  padding: 0;
  height: 100%;
}

.el-aside {
  height: 100%;
  border-right: 1px solid #ebeef5;
}

.el-menu {
  border-right: none;
}

.el-header {
  line-height: 100px;
}

.el-menu-item {
  font-size: large;
}

.el-row {
  //margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
}

.bg-purple-dark {
  background: #99a9bf;
}

.bg-purple {
  background: #d3dce6;
}

.bg-purple-light {
  background: #e5e9f2;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}

.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}


.text-align-left {
  text-align: left;
}

.border-top {
  border-top: 1px solid #ebeef5;
}


</style>