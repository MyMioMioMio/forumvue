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
        <el-menu-item>
          <el-input placeholder="请输入内容" v-model="searchString">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-menu-item>

        <el-menu-item style="float: right">
          <span>{{user.username}}  </span>
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
                    <el-avatar :size="50" :src="scope.row.sectionPhoto" :fit="fit"></el-avatar><br>
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
      //图片样式为填充
      fit: "cover",

      activeIndex: "/",
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
      //帖子数组假数据
      posts: []
    };
  },
  methods: {
    //获得数据
    getAll() {
      var params = this.currentPage + "/" + this.pageSize;
      //console.log(params);
      axios.get("http://10.62.192.125/sections/" + params)
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
      console.log(row);
    },

    //跳转到贴吧
    showSection(sid) {
      //设置axios跨域访问时携带凭证
      axios.defaults.withCredentials = true;
      axios.get("http://10.62.192.125/sections/" + sid)
          .then((res) => {
            if (res.data.code == 30001) {
              var href = res.data.data;
              this.$router.push(href);
            } else {
              this.$message({
                showClose: true,
                message: res.data.msg,
                type: 'error'
              });
            }
          });
      //console.log(sid);
    }
  },

  mounted() {
    this.getAll();
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
