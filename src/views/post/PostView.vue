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
      <!--吧信息 + 楼主内容-->
      <div>
        <el-row>
          <el-col :span="2">
            <el-image
                style="width: 50px; height: 50px;box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1)"
                :src="returnSectionPhotoSrc(sectionData.sid)"
                :key="returnSectionPhotoSrc(sectionData.sid)"
                :fit="fit"
            >
            </el-image>
          </el-col>
          <el-col :span="20" class="text-align-left">
            <el-link @click="showSection">
              <span style="font-size: x-large">{{ sectionData.sectionName }}</span>
            </el-link>
            <br>
            <span>{{ sectionData.sectionDescription }}</span>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <!--楼主信息-->
        <el-row>
          <el-col :span="2">
            <el-avatar :size="60" :src="postUserVo.userPhotoSrc" :fit="fit"></el-avatar>
            <br>
            <span style="font-size: small; text-align: left">{{ postUserVo.username }}</span><br>
            <el-tag>楼主</el-tag>
          </el-col>

          <el-col :span="22" class="text-align-left">
            <el-row style="line-height: 20px">
              <el-col>
                <h2>{{ postUserVo.postsTitle }}</h2>
              </el-col>
            </el-row>
            <span class="text-common">{{ postUserVo.postsDescription }}</span><br>
            <i class="el-icon-time">{{ postUserVo.postsDateTime }}</i>
            <span class="float-right">点赞预留位</span>
          </el-col>
        </el-row>
        <el-divider></el-divider>
      </div>
      <!--层主展示-->
      <div>
        <template>
          <el-table
              :data="replys"
              style="width: 100%"
              :show-header="false"
          >
            <el-table-column width="70px">
              <template v-slot="scope">
                <!-- scope.$index 表示当前行的索引 -->
                <el-tag>{{ returnCountofAllReply(scope.$index) }}楼</el-tag>
              </template>
            </el-table-column>

            <el-table-column>
              <template v-slot="scope">
                <el-row>
                  <el-col :span="2">
                    <el-avatar :size="60" :src="returnUserPhotoSrc(scope.row.uid)"
                               :key="returnUserPhotoSrc(scope.row.uid)" :fit="fit"></el-avatar>
                    <br>
                    <span style="font-size: small">{{ scope.row.username }}</span><br>
                    <el-tag v-if="scope.row.uid == postUserVo.uid">楼主</el-tag>
                  </el-col>

                  <el-col :span="22" class="text-align-left">
                    <span class="text-common">{{ scope.row.replyDescription }}</span><br>
                    <i class="el-icon-time">{{ scope.row.replyDateTime }}</i>
                    <br>
                    <!--重写整个回复的回复, 完成-->
                    <el-link @click="showToReply(scope.row)"><i class="el-icon-s-comment">查看回复</i></el-link>
                    <el-link @click="liked(scope.row)" style="margin-left: 15px"><i
                        class="el-icon-thumb">点赞({{ scope.row.likes }})</i></el-link>
                    <br>
                    <!--回复的回复-->
                    <div v-if="scope.row.toReplyVisible">
                      <template>
                        <el-table
                            :data="scope.row.toReplys"
                            style="width: 100%"
                            :show-header="false"
                        >
                          <el-table-column>
                            <template v-slot="scope">
                              <el-row>
                                <el-col :span="2">
                                  <el-avatar :size="60" :src="returnUserPhotoSrc(scope.row.uid)"
                                             :key="returnUserPhotoSrc(scope.row.uid)" :fit="fit"></el-avatar>
                                  <br>
                                  <span style="font-size: small">{{ scope.row.username }}</span><br>
                                  <el-tag v-if="scope.row.uid == postUserVo.uid">楼主</el-tag>
                                </el-col>

                                <el-col :span="22" class="text-align-left">
                                  <span class="text-common">{{ scope.row.replyDescription }}</span><br>
                                  <i class="el-icon-time">{{ scope.row.replyDateTime }}</i>
                                  <br>
                                  <el-link @click="replyDescription='@' + scope.row.username + ':'"><i
                                      class="el-icon-s-comment">回复</i></el-link>
                                  <el-link @click="liked(scope.row)" style="margin-left: 15px"><i
                                      class="el-icon-thumb">点赞({{ scope.row.likes }})</i></el-link>
                                </el-col>
                              </el-row>
                            </template>
                          </el-table-column>
                        </el-table>
                        <el-pagination
                            @size-change="handleSizeChange2(scope.row, $event)"
                            @current-change="handleCurrentChange2(scope.row, $event)"
                            :current-page="1"
                            :page-sizes="[5, 10, 20]"
                            :page-size="5"
                            layout="total, sizes, prev, pager, next, jumper"
                            :total="scope.row.totalPage"
                            background
                        >
                        </el-pagination>
                        <!--回复层主-->
                        <el-row>
                          <el-button type="primary" size="small" @click="postReply(scope.row.rid)">回复</el-button>
                        </el-row>
                        <el-row>
                          <el-input type="textarea" v-model="replyDescription" :rows="3" maxlength="100"
                                    show-word-limit></el-input>
                        </el-row>
                      </template>
                    </div>
                  </el-col>
                </el-row>
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
        <!--回复楼主-->
        <el-row>
          <el-button type="primary" size="small" class="float-left" @click="postReply(0)">回复</el-button>
        </el-row>
        <el-row>
          <el-input type="textarea" v-model="replyDescription" :rows="3" maxlength="1000" show-word-limit></el-input>
        </el-row>
      </div>
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
    return {
      //服务器地址
      ip: 'http://10.62.192.125',

      //用户头像地址
      userPhotoSrc: null,

      //展开评论指示
      collapse: [],

      //图片样式为填充
      fit: "cover",

      //sectionNav: 1,

      //当前页码
      currentPage: 1,
      //总条数
      totalPage: 400,
      //页内条数
      pageSize: 5,

      //回复的回复的当前页码
      currentPage2: 1,
      //回复的回复的页内条数
      pageSize2: 5,

      //楼主模型
      postUserVo: {
        pid: "",
        uid: "",
        username: "",
        userPhotoSrc: "",
        postsTitle: "",
        postsDescription: "",
        postsDateTime: "",
        sid: ""
      },
      //登录标志
      loginFlag: false,
      searchString: "",
      //吧信息
      sectionData: {
        sid: "",
        sectionName: "test吧",
        sectionDescription: "test吧吧吧吧吧吧吧吧吧吧吧吧吧吧",
        sectionPhoto: "",
        sectionDatetime: ""
      },
      //用户模型
      user: {},
      //回复数组
      replys: [],
      //回复的回复数组
      toReplys: [],

      //回复模型
      reply: {
        uid: '',
        pid: '',
        replyDescription: '',
        toRid: '',
      },
      replyDescription: ''
      //回复内容

    };
  },
  methods: {
    //获得贴吧信息
    getSection() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.get(this.ip + "/sections")
          .then((res) => {
            //console.log(res.data)
            if (res.data.code == 20001) {
              //获取成功
              this.sectionData = res.data.data;
              //获取帖子信息
              this.getPost();
            } else {
              //获取失败则返回上一页
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
              this.lastPage();
            }
          });
    },

    //获取帖子信息
    getPost() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.get(this.ip + "/posts")
          .then((res) => {
            //console.log(res.data)
            if (res.data.code == 20001) {
              //获取成功
              this.postUserVo = res.data.data;
              this.postUserVo.userPhotoSrc = this.returnUserPhotoSrc(this.postUserVo.uid);
              //获取所有回复信息
              this.getReplys();
            } else {
              //获取失败则返回上一页
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
              this.lastPage();
            }
          });
    },

    //获取回复信息
    getReplys() {
      var params = this.currentPage + "/" + this.pageSize + "/" + this.postUserVo.pid;
      axios.get(this.ip + "/replys/" + params)
          .then(res => {
            if (res.data.code == 20001) {
              //获取成功
              this.replys = res.data.data.replysData;
              this.totalPage = res.data.data.totalPage;
            } else {
              //获取失败则返回上一页
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
              this.lastPage();
            }
          });
    },

    //获得回复的回复
    getToReply(row, currentPage, pageSize) {
      //保存当前页数
      row.currentPage = currentPage;
      //保存当前页内条数
      row.pageSize = pageSize;
      var params = currentPage + "/" + pageSize + "/" + this.postUserVo.pid + '/' + row.rid;
      axios.get(this.ip + "/replys/" + params)
          .then(res => {
            if (res.data.code == 20001) {
              //获取成功
              //使用这种方式刷新数据，才能使vue对该数据的变化响应
              this.$set(row, 'toReplys', res.data.data.replysData);
              row.totalPage = res.data.data.totalPage;
              //console.log(row.toReplys);
            } else {
              row.toReplys = [];
              row.totalPage = 0;
            }
          });
    },

    //处理展开评论
    showToReply(row) {
      row.toReplyVisible = !row.toReplyVisible;
      //初始化
      row.currentPage = 1;
      row.pageSize = 5;
      this.getToReply(row, row.currentPage, row.pageSize);
    },

    //顶部导航栏
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },


    //页内条数变化
    handleSizeChange(val) {
      //console.log(`每页 ${val} 条`);
      this.pageSize = val;
      this.getReplys();
    },
    //当前页变化
    handleCurrentChange(val) {
      //console.log(`当前页: ${val}`);
      this.currentPage = val;
      this.getReplys();
    },

    //回复的回复页内条数变化
    handleSizeChange2(row, val) {
      //console.log(`每页 ${val} 条`);
      row.pageSize = val;
      // console.log(rid);
      // console.log(this.pageSize2);
      this.getToReply(row, row.currentPage, row.pageSize);
    },
    //回复的回复当前页变化
    handleCurrentChange2(row, val) {
      //console.log(`当前页: ${val}`);
      row.currentPage = val;
      // console.log(rid);
      // console.log(this.currentPage2);
      this.getToReply(row, row.currentPage, row.pageSize);
    },

    //返回上一页
    lastPage() {
      this.$router.back();
    },

    //返回回复数
    returnCount() {
      return 50;
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
      //console.log(this.ip + "/users/download/" + uid);
      //console.log("src==>" + this.ip + "/users/download/" + uid);
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

    //跳转到贴吧
    showSection() {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.get(this.ip + "/sections/" + this.sectionData.sid)
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

    //回复
    postReply(toRid) {
      //数据预处理
      this.reply.uid = this.user.uid;
      this.reply.toRid = toRid;
      this.reply.pid = this.postUserVo.pid;
      this.reply.replyDescription = this.replyDescription;
      //console.log(this.reply);
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //上传回复
      axios.post(this.ip + "/replys", this.reply)
          .then(res => {
            if (res.data.code == 30001) {
              //回复成功
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
              //刷新回复
              this.getReplys();
            } else {
              //回复失败
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
            //清空数据
            this.reply = {
              uid: '',
              pid: '',
              replyDescription: '',
              toRid: '',
            }
            this.replyDescription = '';
          });
    },

    //返回楼数
    returnCountofAllReply(index) {
      return this.totalPage - (this.currentPage - 1) * this.pageSize - index;
    },

    //点赞功能
    liked(row) {
      //数据处理
      let form = {
        rid: row.rid,
        uid: this.user.uid
      }
      //上传点赞
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.post(this.ip + "/replys/like", form)
          .then(res => {
            if (res.data.code == 80001) {
              //点赞成功
              row.likes++;
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'success'
              });
            } else {
              //点赞失败
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          });
      //console.log(row);
    }
  },
  mounted() {
    //获取吧信息
    this.getSection();
    this.getUser();
    //获取贴子信息
    //this.getPost();已放到getSection中
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

.text-common {
  font-size: large;
  white-space: pre;
}

.float-right {
  float: right;
}

.float-left {
  float: left;
}
</style>