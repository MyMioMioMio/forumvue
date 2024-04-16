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
          <span>{{ userPost.username }}  </span>
          <el-dropdown>
            <el-avatar :size="50" :src="userPost.userPhoto" :fit="fit"></el-avatar>
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
            <el-avatar :size="60" :src="userPost.userPhoto" :fit="fit"></el-avatar>
            <br>
            <span style="font-size: small; text-align: left">{{ userPost.username }}</span><br>
            <el-tag>楼主</el-tag>
          </el-col>

          <el-col :span="22" class="text-align-left">
            <el-row style="line-height: 20px">
              <el-col>
                <h2>{{userPost.postsTitle}}</h2>
              </el-col>
            </el-row>
            <span class="text-common">{{userPost.postsDescription}}</span><br>
            <i class="el-icon-time">{{ userPost.postsDateTime }}</i>
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
                    <el-tag v-if="scope.row.uid == userPost.uid">楼主</el-tag>
                  </el-col>

                  <el-col :span="22" class="text-align-left">
                    <span class="text-common">{{scope.row.replyDescription}}</span><br>
                    <i class="el-icon-time">{{ scope.row.replyDateTime}}</i>
                    <span class="float-right">点赞预留位</span>
                    <el-collapse>
                      <el-collapse-item>
                        <template slot="title">
                          查看回复
                        </template>
                        <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
                        <div>在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。</div>
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

      //用户模型
      userPost: {
        pid: "",
        uid: "200002",
        username: "testuser",
        userPhoto: "",
        postsTitle: "健康生活",
        postsDescription: "本人挺磕素睦的，并且这也是一个热门cp，所以看到有人说素睦邪道我都是啪的点进去就是反驳，但看了些帖子后确实得承认以下几点\n" +
            "1:睦在素祥相争的时候无疑都是站在了祥子那边\n" +
            "2:对素世看起来像“暗恋”的感情更多是由内疚感驱动的\n" +
            "3:即在优先祥子的情况下对素世妥协，比如前八集任由素世弄她的惊世智慧，但在关键的地方仍然没有支持素世\n" +
            "4结论:睦早已做出选择 素世也已经切割\n" +
            "唉，希望第二季素睦能发力吧（但狗团剧情不会太多吧）",
        postsDateTime: "2024-04-14 13:01:21",
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
      //帖子信息
      post: {
        pid: '',
        uid: '',
        username: 'name',
        userPhoto: '',
        postsTitle: '',
        postsDescription: '',
        sid: '',
        postsDatetime: ''
      },
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

    //获取帖子信息
    getPosts() {

    },

    //顶部导航栏
    handleSelect(key, keyPath) {
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

    //返回上一页
    lastPage() {
      this.$router.back();
    },

    //返回回复数
    returnCount() {
      return 50;
    }
  },
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