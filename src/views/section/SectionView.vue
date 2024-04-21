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
          <span>{{user.username}}  </span>
          <el-dropdown @command="handleCommand">
            <el-avatar :size="50" :src="user.userPhoto" :fit="fit"></el-avatar>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="loginFlag == true">个人页面</el-dropdown-item>
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
                :src="sectionData.sectionPhoto"
                :fit="fit"
            >
            </el-image>
          </el-col>
          <el-col :span="20" class="text-align-left">
            <span style="font-size: xxx-large">{{ sectionData.sectionName }}</span>
            <div>
              <el-divider content-position="left">介绍</el-divider>
            </div>
            <span>{{ sectionData.sectionDescription }}</span>
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
                    <el-avatar :size="50" :src="scope.row.userPhoto" :fit="fit"></el-avatar>
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
    return {
      //新建贴子对话框标志
      postDialogVisible: false,

      //图片样式为填充
      fit: "cover",

      //sectionNav: 1,

      //当前页码
      currentPage: 1,
      //总页数
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
    //获得贴吧信息
    getSection() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.get("http://10.62.192.125/sections")
          .then((res) => {
            console.log(res.data)
            if (res.data.code == 20001) {
              //获取成功
              this.sectionData = res.data.data;
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

    //获取指定贴吧的帖子信息
    getPosts() {
      var params = this.currentPage + "/" + this.pageSize + "/" + this.sectionData.sid;
      axios.get("http://10.62.192.125/posts/" + params)
          .then((res) => {
            if (res.data.code == 20001) {
              this.posts = res.data.data.pageData;
              this.totalPage = res.data.totalPage;
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
      axios.get("http://10.62.192.125/posts/" + row.pid + '/' + row.sid)
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
      } else {
        this.$router.push(command);
      }

    },

    //检查有无登录，并获取登录信息
    getUser() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //获取用户信息
      axios.get("http://10.62.192.125/users")
          .then(res => {
            if (res.data.code == 20001) {
              //获取成功
              this.user = res.data.data;
              this.loginFlag = true;
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
      axios.get("http://10.62.192.125/users/quitlogin")
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
      axios.post("http://10.62.192.125/posts", this.post)
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

.text-align-left {
  text-align: left;
}

.border-top {
  border-top: 1px solid #ebeef5;
}
</style>



