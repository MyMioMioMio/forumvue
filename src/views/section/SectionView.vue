<template>
  <el-container>
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
    <!--体部分-->
    <el-main>
      <!--吧信息内容-->
      <div>
        <el-row>
          <el-col :span="4">
            <el-image
                style="width: 200px; height: 200px;box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)"
                :src="photoSrc"
                :fit="fit"
            >
            </el-image>
          </el-col>
          <el-col :span="20" class="text-align-left">
            <span style="font-size: xxx-large">{{ sectionData.sectionName }}</span>
            <div>
              <el-divider content-position="left">介绍</el-divider>
            </div>
            <span>{{ sectionData.sectionDescription }}</span><br>
            <i class="el-icon-time">创建时间:{{ sectionData.sectionDatetime }}</i>
          </el-col>
        </el-row>
        <el-menu
            :default-active="$route.path"
            class="el-menu-demo border-top"
            mode="horizontal"
            @select="handleSelect"
            text-color="#409eff"
            active-text-color="#E6A23C"
        >
          <el-menu-item index="1">看帖</el-menu-item>
          <el-menu-item style="float: right">
            <el-button type="primary" plain @click="postDialogVisible = true">发帖</el-button>
          </el-menu-item>

          <el-menu-item style="float: right">
            <el-button type="primary" plain @click="updateDialogVisible = true; beforeHandle()">修改吧信息</el-button>
          </el-menu-item>
        </el-menu>
        <div class="line"></div>
      </div>
      <!--帖子展示-->
      <div>
        <template>
          <el-table
              :data="posts"
              style="width: 100%"
              :show-header="false"
          >
            <el-table-column
                type="index"
                width="50"
                align="center"
            >
            </el-table-column>
            <el-table-column>
              <template v-slot="scope">
                <el-row>
                  <el-col :span="2">
                    <el-avatar :size="50" :src="returnUserPhotoSrc(scope.row.uid)" :fit="fit"></el-avatar>
                    <br>
                    <span style="font-size: small; text-align: center">{{ scope.row.username }}</span>
                  </el-col>

                  <el-col :span="22">
                    <el-link @click="showPost(scope.row)">
                      <h2>{{ scope.row.postsTitle }}</h2>
                    </el-link>
                    <p style="font-size: large">{{ scope.row.postsDescription.slice(0, 50) + '...' }}</p>
                    <i class="el-icon-time">{{ scope.row.postsDateTime }}</i>
                  </el-col>
                </el-row>
                <!--                {{scope.row.postsTitle}}-->
              </template>
            </el-table-column>
          </el-table>
        </template>
      </div>
      <!--分页条-->
      <div>
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="1"
            :page-sizes="[5, 10, 20]"
            :page-size="5"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalPage"
            background
        >
        </el-pagination>
      </div>
      <!--新建贴子页面-->
      <el-dialog title="新建贴子" :visible.sync="postDialogVisible" width="40%">
        <el-form :model="post" ref="post" :rules="postRules">
          <el-form-item label="标题" prop="postsTitle">
            <el-input v-model="post.postsTitle"
                      type="text"
                      maxlength="10"
                      show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item label="内容" prop="postsDescription">
            <el-input type="textarea"
                      v-model="post.postsDescription"
                      maxlength="1000"
                      :rows="10"
                      show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitPostCheck('post')">提交</el-button>
            <el-button @click="postDialogVisible = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!--修改贴吧页面-->
      <el-dialog title="修改贴吧" :visible.sync="updateDialogVisible" width="40%">
        <!--上传头像-->
        <el-row>
          <div style="float: left">
            <!--头像部分-->
            <el-upload
                class="avatar-uploader"
                action
                :http-request="upload"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload">
              <img v-if="recallPhotoSrc" :src="recallPhotoSrc" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <h1>设置头像</h1>
          </div>
        </el-row>

        <!--修改贴吧内容-->
        <el-form :model="section" ref="section" :rules="sectionRules">
          <el-form-item label="贴吧名称" prop="sectionName">
            <el-input v-model="section.sectionName"
                      type="text"
                      maxlength="19"
                      show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item label="贴吧简介">
            <el-input type="textarea"
                      v-model="section.sectionDescription"
                      maxlength="30"
                      :rows="2"
                      show-word-limit
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitSectionCheck('section')">提交</el-button>
            <el-button @click="cancel()">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>


    </el-main>
    <!--制作信息-->
    <el-footer>
      <span style="text-align: center; font-size: x-small; color: #99a9bf">制作byMyMioMioMio</span>
    </el-footer>
  </el-container>


</template>
<script>
import axios from "axios";

export default {
  data() {
    //贴子标题校验
    const validatepostsTitle = (rule, value, callback) => {
      if (!value) {
        callback(new Error('标题不能为空！'));
      } else {
        callback();
      }
    }

    //贴吧名称校验
    const validateSectionName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('贴吧名称不能为空！'));
      } else {
        callback();
      }
    }

    return {
      //服务器地址
      ip: 'http://10.62.192.125',

      //贴吧头像地址
      photoSrc: null,

      //回显贴吧头像地址
      recallPhotoSrc: null,

      //显示吧信息修改页面
      updateDialogVisible: false,

      //用户头像地址
      userPhotoSrc: null,

      //新建贴子对话框标志
      postDialogVisible: false,

      //图片样式为填充
      fit: "cover",

      //sectionNav: 1,

      //当前页码
      currentPage: 1,
      //总条数
      totalPage: 400,
      //页内条数
      pageSize: 5,

      //用户模型
      user: {},
      loginFlag: false,
      searchString: "",
      //吧信息
      sectionData: {
        sid: "",
        sectionName: "",
        sectionDescription: "",
        sectionPhoto: "",
        sectionDatetime: ""
      },

      //修改吧信息
      section: {
        sid: '',
        sectionName: '',
        sectionDescription: '',
      },

      //修改贴吧表单校验规则
      sectionRules: {
        sectionName: [{required: true, trigger: 'blur', validator: validateSectionName}]
      },

      //帖子信息
      post: {
        pid: '',
        uid: '',
        username: '',
        userPhoto: '',
        postsTitle: '',
        postsDescription: '',
        sid: '',
        postsDatetime: ''
      },
      //帖子
      posts: [],

      //贴子表单校验规则
      postRules: {
        postsTitle: [{required: true, trigger: 'blur', validator: validatepostsTitle}]
      }
    };
  },
  methods: {

    //上传头像的方法
    upload(item) {
      //设置表单
      let formData = new FormData();
      formData.append("file", item.file);
      formData.append("sid", this.sectionData.sid);
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //上传头像
      axios.post(this.ip + "/sections/uploadavatar", formData)
          .then(res => {
            if (res.data.code == 30001) {
              //上传成功
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
              //设置用户头像路径
              this.photoSrc = this.ip + "/sections/download/" + this.sectionData.sid;
              //设置回显头像路径
              this.recallPhotoSrc = this.ip + "/sections/download/" + this.sectionData.sid;
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

    //获得贴吧信息
    getSection() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.get(this.ip + "/sections")
          .then((res) => {
            console.log(res.data)
            if (res.data.code == 20001) {
              //获取成功
              this.sectionData = res.data.data;
              this.photoSrc = this.returnSectionPhotoSrc(this.sectionData.sid);
              //获取所有帖子信息
              this.getPosts();
            } else {
              //获取失败则返回上一页
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
              this.$router.back();
            }
          });
    },

    //修改贴吧的预处理
    beforeHandle() {
      this.section.sid = this.sectionData.sid + '';
      this.section.sectionName = this.sectionData.sectionName.slice(0, -1);
      this.section.sectionDescription = this.sectionData.sectionDescription + '';
    },

    //获取指定贴吧的帖子信息
    getPosts() {
      var params = this.currentPage + "/" + this.pageSize + "/" + this.sectionData.sid;
      axios.get(this.ip + "/posts/" + params)
          .then((res) => {
            if (res.data.code == 20001) {
              this.posts = res.data.data.pageData;
              this.totalPage = res.data.data.totalPage;
            } else {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          })
    },

    //顶部导航栏
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    //贴吧导航栏
    handleSelect2(key, keyPath) {
      console.log(key, keyPath);
    },
    //页内条数变化
    handleSizeChange(val) {
      //console.log(`每页 ${val} 条`);
      this.pageSize = val;
      this.getPosts();
    },

    //当前页变化
    handleCurrentChange(val) {
      //console.log(`当前页: ${val}`);
      this.currentPage = val;
      this.getPosts();
    },

    //跳转到点击的贴子
    showPost(row) {
      // console.log(pid);
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //上传pid和sid保存到服务器session
      axios.get(this.ip + "/posts/" + row.pid + '/' + row.sid)
          .then(res => {
            if (res.data.code == 30001) {
              //成功则跳转到post页面
              //var href = res.data.data;
              this.$router.push('/post');
            } else {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          });
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

    //返回用户头像路径
    returnUserPhotoSrc(uid) {
      return this.ip + "/users/download/" + uid;
    },

    //返回贴吧头像路径
    returnSectionPhotoSrc(sid) {
      return this.ip + "/sections/download/" + sid;
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
    //校验贴子
    submitPostCheck(post) {
      this.$refs[post].validate((valid) => {
        if (valid) {
          this.submitPost();
        } else {
          //console.log('error submit!!');
          return false;
        }
      });
    },

    //提交贴子
    submitPost() {
      //数据预处理
      this.post.uid = this.user.uid;
      this.post.sid = this.sectionData.sid;
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //提交贴子
      axios.post(this.ip + "/posts", this.post)
          .then(res => {
            if (res.data.code == 30001) {
              //提交成功
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
              //关闭对话框
              this.postDialogVisible = false;
              //清空post
              this.post = {
                pid: '',
                uid: '',
                username: '',
                userPhoto: '',
                postsTitle: '',
                postsDescription: '',
                sid: '',
                postsDatetime: ''
              }
              //刷新页面
              this.getPosts();
            } else {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          });
    },

    //校验贴吧
    submitSectionCheck(section) {
      this.$refs[section].validate((valid) => {
        if (valid) {
          this.submitSection();
        } else {
          //console.log('error submit!!');
          return false;
        }
      });
    },

    //更新贴吧
    submitSection() {
      //数据预处理
      this.section.sectionName += "吧";
      //console.log(this.section);
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //提交贴子
      axios.put(this.ip + "/sections", this.section)
          .then(res => {
            if (res.data.code == 70001) {
              //提交成功
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
              //关闭对话框
              this.updateDialogVisible = false;
              //刷新页面
              this.getSection();
            } else {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          });
    },

    //更新页面的取消按钮
    cancel() {
      this.updateDialogVisible = false;
      this.$router.go(0);
    }
  },
  mounted() {
    this.getSection();
    this.getUser();
    //console.log(this.sectionData);
    //this.getPosts();//已经放到this.getSection()方法中去执行了
  }
}
</script>

<style>
.el-header {
  line-height: 100px;
}

.el-menu-item {
  font-size: large;
}

.el-row {
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

.text-align-left {
  text-align: left;
}

.border-top {
  border-top: 1px solid #ebeef5;
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


</style>



