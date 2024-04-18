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

        <el-menu-item style="float: right">
          <span>{{ user.username }}  </span>
          <el-dropdown>
            <el-avatar :size="50" :src="user.userPhoto" :fit="fit"></el-avatar>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="loginFlag == true">个人页面</el-dropdown-item>
              <!--              <el-dropdown-item>登录</el-dropdown-item>-->
              <el-dropdown-item v-if="loginFlag == true">登出</el-dropdown-item>
              <el-dropdown-item v-if="loginFlag == false">登录</el-dropdown-item>
              <el-dropdown-item v-if="loginFlag == false">注册</el-dropdown-item>
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
                :src="sectionData.sectionPhoto"
                :fit="fit"
            >
            </el-image>
          </el-col>
          <el-col :span="20" class="text-align-left">
            <span style="font-size: x-large">{{ sectionData.sectionName }}</span><br>
            <span>{{ sectionData.sectionDescription }}</span>
          </el-col>
        </el-row>
        <el-divider></el-divider>
        <!--楼主信息-->
        <el-row>
          <el-col :span="2">
            <el-avatar :size="60" :src="postUserVo.userPhoto" :fit="fit"></el-avatar>
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
      <!--帖子展示-->
      <div>
        <template>
          <el-table
              :data="replys"
              style="width: 100%"
              :show-header="false"
          >
            <el-table-column>
              <template v-slot="scope">
                <el-row>
                  <el-col :span="2">
                    <el-avatar :size="60" :src="scope.row.userPhoto" :fit="fit"></el-avatar>
                    <br>
                    <span style="font-size: small">{{ scope.row.username }}</span><br>
                    <el-tag v-if="scope.row.uid == postUserVo.uid">楼主</el-tag>
                  </el-col>

                  <el-col :span="22" class="text-align-left">
                    <span class="text-common">{{ scope.row.replyDescription }}</span><br>
                    <i class="el-icon-time">{{ scope.row.replyDateTime }}</i>
                    <span class="float-right">点赞预留位</span>
                    <el-collapse>
                      <el-collapse-item>
                        <template slot="title">
                          查看回复
                        </template>
                        <div>

                        </div>
                      </el-collapse-item>
                    </el-collapse>
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
    const fakeReplys1 = {
      rid: 200001,
      uid: 200001,
      username: 'name',
      userPhoto: '',
      replyDescription: '这是一则内容\n能够换行\n能给个看着',
      replyDateTime: '2024-04-14 13:01:21'
    };
    // const fakeReplys2 = {
    //   rid: 200002,
    //   uid: 200001,
    //   username: 'name',
    //   userPhoto: '',
    //   replyDescription: '这是一则内容\n能够换行\n能给个看着',
    //   replyDateTime: '2024-04-14 13:01:21'
    // };

    var replysArr = new Array(20);
    replysArr.fill(fakeReplys1);
    // replysArr.fill(fakeReplys2, 1, 2);
    //********************************************************
    return {
      //展开评论指示
      activeNames: 1,

      //图片样式为填充
      fit: "cover",

      //sectionNav: 1,

      //当前页码
      currentPage: 1,
      //总页数
      totalPage: 400,
      //页内条数
      pageSize: 5,

      //楼主模型
      postUserVo: {
        pid: "",
        uid: "",
        username: "",
        userPhoto: "",
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
      replys: replysArr
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
      axios.get("http://10.62.192.125/posts")
          .then((res) => {
            //console.log(res.data)
            if (res.data.code == 20001) {
              //获取成功
              this.postUserVo = res.data.data;
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
      axios.get("http://10.62.192.125/replys/" + params)
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

    //返回上一页
    lastPage() {
      this.$router.back();
    },

    //返回回复数
    returnCount() {
      return 50;
    }
  },
  mounted() {
    //获取吧信息
    this.getSection();
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
</style>