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
      <!--所有贴吧的帖子展示-->
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
                  <!--贴吧头像-->
                  <el-col :span="2">
                    <el-avatar :size="50" :src="returnSectionPhotoSrc(scope.row.sid)" :key="returnSectionPhotoSrc(scope.row.sid)" :fit="fit"></el-avatar><br>
                    <el-link @click="showSection(scope.row.sid)">
                      <span style="font-size: small; text-align: center">{{scope.row.sectionName}}</span>
                    </el-link>
                  </el-col>
                  <!--帖子详情-->
                  <el-col :span="22">
                    <el-link @click="showPost(scope.row)">
                      <h2>{{scope.row.postsTitle}}</h2>
                    </el-link>
                    <p style="font-size: large">{{scope.row.postsDescription.slice(0, 50) + '...'}}</p>
                    <i class="el-icon-time">{{scope.row.postsDateTime}}</i>
                    <el-link @click="postLiked(scope.row)" style="margin-left: 15px"><i
                        class="el-icon-thumb">点赞({{ scope.row.likes }})</i></el-link>
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
    //帖子临时数据
    // const fakePost = {
    //   pid: 200001,
    //   sectionName: 'Test吧',
    //   sectionPhoto: '',
    //   postsTitle: '第二个帖子标题',
    //   postsDescription: '第二个帖子内容：《叶圣陶散文》为“名家经典珍藏”丛书之一，收录了叶圣陶先生的散文精品数十篇。这些作品内容丰富，题材各异，构思精巧，文笔精巧、语言幽默、内蕴深厚、风格恬淡，充分显示了叶圣陶先生的文学功底及丰富的人生阅历，从一个侧面反映了作者的思想感情及创作风格，非常值得一读。叶圣陶是20世纪中国一位杰出的作家、教育家和出版家，又是中国现代儿童文学创作的先行者。作为散文家，他早期和周作人、朱自清共同成为文学研究会散文创作的中坚，后来又成为开明派散文的代表，其散文被一九三五年出版的《中国新文学大系》选录的篇数仅次于周作人、鲁迅和朱自清。',
    //   sid: 200002,
    // }
    return {
      //服务器地址
      ip: 'http://10.62.192.125',

      //用户头像地址
      userPhotoSrc: null,

      //图片样式为填充
      fit: "cover",

      activeIndex: "/",
      //sectionNav: 1,
      //当前页码
      currentPage: 1,
      //总条数
      totalPage: 400,
      //页内条数
      pageSize: 5,
      //用户模型
      user: {},
      //登录标记
      loginFlag: false,
      //查询信息
      searchString: "",
      // //吧信息
      // sectionData: {
      //   sid:1,
      //   sectionName:"Test吧",
      //   sectionDescription:"Test吧hahahahaha",
      //   sectionPhoto:"src/assets/logo.png",
      //   sectionDatetime:"2024-04-05 22:07:18"
      // },

      //吧 + 帖子信息
      post: {
        pid: '',
        sectionName: '',
        sectionPhoto: '',
        postsTitle: '',
        postsDescription: '',
        sid: '',
        postsDateTime: '',
      },
      //帖子数组数据
      posts: []
    };
  },
  methods: {
    //获得数据
    getAll() {
      var params = this.currentPage + "/" + this.pageSize;
      //console.log(params);
      axios.get( this.ip + "/sections/" + params)
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

    //贴子点赞
    postLiked(postdata) {
      //数据处理
      let form = {
        pid: postdata.pid,
        uid: this.user.uid
      }
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      //上传点赞
      axios.post(this.ip + "/posts/like", form)
          .then(res => {
            if (res.data.code == 80001) {
              //点赞成功
              postdata.likes++;
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
