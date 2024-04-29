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
          :default-active="activeIndex"
          router
      >
        <el-menu-item style="font-size: xx-large">贴吧</el-menu-item>
        <el-menu-item index="/">推荐</el-menu-item>
        <el-menu-item index="/index2">仅关注</el-menu-item>
        <el-menu-item index="/index3">关注的贴吧</el-menu-item>
        <el-menu-item index="/sections">所有贴吧</el-menu-item>
        <el-menu-item>
          <el-input placeholder="请输入内容" v-model="searchString">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-menu-item>
        <!--用户行为-->
        <el-menu-item style="float: right">
          <span>{{user.username}}  </span>
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
      <!--所有贴吧的展示-->
      <div>
        <template>
          <el-table
              :data="sectionData"
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
                  <!--贴吧头像-->
                  <el-col :span="2">
                    <el-avatar :size="60" :src="returnSectionPhotoSrc(scope.row.sid)" :fit="fit" shape="circle"></el-avatar>
                  </el-col>
                  <!--帖子详情-->
                  <el-col :span="22">
                    <el-link @click="showSection(scope.row.sid)">
                      <h2>{{scope.row.sectionName}}</h2>
                    </el-link>
                    <p style="font-size: large">{{scope.row.sectionDescription}}</p>
                    <i class="el-icon-time">{{scope.row.sectionDatetime}}</i>
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
      <!--新建贴吧按钮-->
      <el-tooltip class="item" effect="dark" content="新建贴吧" placement="left">
        <el-button
            type="primary"
            icon="el-icon-plus"
            style="position: fixed; bottom: 100px; right: 100px"
            @click="postDialogVisible=true"
            circle
        >
        </el-button>
      </el-tooltip>

      <!--新建贴吧页面-->
      <el-dialog title="新建贴吧" :visible.sync="postDialogVisible" width="40%">
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

      //新建贴吧页面标志
      postDialogVisible: false,

      //贴吧表单校验规则
      sectionRules: {
        sectionName: [{required: true, trigger: 'blur', validator: validateSectionName}]
      },

      //用户头像地址
      userPhotoSrc: null,

      //图片样式为填充
      fit: "cover",

      activeIndex: "/sections",
      //sectionNav: 1,
      //当前页码
      currentPage: 1,
      //总页数
      totalPage: 400,
      //页内条数
      pageSize: 5,
      //用户模型
      user: {},
      //登录标记
      loginFlag: false,
      //查询信息
      searchString: "",
      //新建吧信息
      section: {
        sid: '',
        sectionName: '',
        sectionDescription: '',
        sectionPhoto: null,
        sectionDatetime: ''
      },

      //所有贴吧数组数据
      sectionData: []
    };
  },
  methods: {
    //获得所有贴吧数据
    getAll() {
      var params = this.currentPage + "/" + this.pageSize;
      //console.log(params);
      axios.get( this.ip + "/sections/all/" + params)
          .then((res) => {
            if (res.data.code == 20001) {
              this.sectionData = res.data.data.pageData;
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
    //页内条数变化
    handleSizeChange(val) {
      //console.log(`每页 ${val} 条`);
      this.pageSize = val;
      this.getAll();
    },
    //当前页变化
    handleCurrentChange(val) {
      //console.log(`当前页: ${val}`);
      this.currentPage = val;
      this.getAll();
    },
    //跳转到帖子
    showPost(row) {
      // console.log(pid);
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //上传pid和sid保存到服务器session
      axios.get( this.ip + "/posts/" + row.pid + '/' + row.sid)
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

    //跳转到贴吧
    showSection(sid) {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.get(this.ip + "/sections/" + sid)
          .then((res) => {
            if (res.data.code == 30001) {
              //var href = res.data.data;
              this.$router.push('/section');
            } else {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          });
      //console.log(sid);
    },

    //处理下拉菜单
    handleCommand(command) {
      if (command == "quitLogin") {
        this.quitLogin();
      } else if (command != this.$route.path){
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

    //提交贴吧
    submitSection() {
      //数据预处理
      this.section.sectionName += "吧";
      //console.log(this.section);
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //提交贴子
      axios.post(this.ip + "/sections", this.section)
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
              //清空section
              this.section ={
                sid: '',
                sectionName: '',
                sectionDescription: '',
                sectionPhoto: null,
                sectionDatetime: ''
              }
              //刷新页面
              this.getAll();
            } else {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          });
    }
  },

  mounted() {
    this.getAll();
    this.getUser();
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
</style>
