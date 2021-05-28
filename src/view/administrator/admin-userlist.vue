<template>
  <div>
    <template v-if="userlist.length !== 0">
      <div v-for="(item, index) in userlist" :key="index">
        <Row>
          <i-col span="2">
            <img
              :src="item.icon"
              style="width: 30%; height: 30%;vertical-align:top;border-radius:50%"
            />
          </i-col>
          <i-col span="5">
            <div class="user-name">
              {{ item.nick_name === "" ? item.username : item.nick_name }}
            </div>
            <p style="margin-top: 5px">
              邮箱: {{ item.email || "暂无邮箱信息" }}
            </p>
          </i-col>
          <i-col offset="10" span="7">
            <i-button
              type="primary"
              style="width: 40%; height: 35px; top: 31px; position: relative"
              @click="jumpUserInfo(item.id)"
            >
              他的主页
            </i-button>
            &nbsp;&nbsp;
            <template v-if="item.in === false">
              <i-button
                type="primary"
                style="width: 40%; height: 35px; top: 31px; position: relative"
                @click="handleImprison(index)"
              >
                关进小黑屋
              </i-button>
            </template>
            <template v-else>
              <i-button
                type="primary"
                style="width: 40%; height: 35px; top: 31px; position: relative"
                @click="handleOutprison(index)"
              >
                解封
              </i-button>
            </template>
          </i-col>
        </Row>
        <Divider />
      </div>
      <div style="float: right">
        <Page
          :total="totalCnt"
          :page-size="pageSize"
          :current="pageIndex"
          @on-change="changePage"
          show-total
        />
      </div>
    </template>
  </div>
</template>

<script>
import UserCard from "@/view/user/user-card";
import { prison, getUserList } from "@/api/user";
export default {
  name: "home",

  components: { UserCard },

  data() {
    return {
      userlist: [
        {
          id: 1,
          username: "admin",
          email: "2583482370@qq.com",
          nick_name: "",
          institution: null,
          in: false,
        },
        {
          id: 2,
          username: "Caesar41",
          email: "365074151@qq.com",
          nick_name: "",
          institution: null,
          in: false,
        },
        {
          id: 3,
          username: "lzw_super",
          email: "liuzhenweilzw@163.com",
          nick_name: "",
          institution: null,
          in: false,
        },
        {
          id: 7,
          username: "Forever518",
          email: "1423429527@qq.com",
          nick_name: "",
          institution: null,
          in: false,
        },
        {
          id: 8,
          username: "zcx2021",
          email: "1025082422@qq.com",
          nick_name: "",
          institution: null,
          in: false,
        },
      ],
      pageIndex: 1,
      totalCnt: 7,
      pageSize: 5,
    };
  },

  mounted() {
    this.getUserList();
  },

  methods: {
    getUserList: function () {
      getUserList(this.pageIndex).then((res) => {
        this.userlist = res.data.user_list;
        this.totalCnt = res.data.total_user;
      });
    },

    changePage: function (i) {
      //   this.$store.commit("setHomePage", i);
      //   this.list = [];
      setTimeout(() => {
        document
          .getElementsByClassName("content-wrapper ivu-layout-content")[0]
          .scroll(0, 0);
      }, 400);
      this.pageIndex = i;
      this.getUserList();
    },

    showUser: function () {
      getUserInfo(3)
        .then((res) => {
          this.userInfo = res.data;
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    },

    handleFollow: function () {
      if (this.userInfo.is_following) {
        unfollow(this.creator.id)
          .then((res) => {
            this.userInfo.is_following = false;
            this.userInfo.total_fan -= 1;
            this.$Message.info("成功取消关注");
          })
          .catch((error) => {
            this.$Modal.error(getErrModalOptions(error));
          });
      } else {
        follow(this.creator.id)
          .then((res) => {
            this.userInfo.is_following = true;
            this.userInfo.total_fan += 1;
            this.$Message.info("成功关注");
          })
          .catch((error) => {
            this.$Modal.error(getErrModalOptions(error));
          });
      }
    },

    handleImprison: function (id) {
    //   prison(id)
    //     .then((res) => {
    //       this.$Message.info("成功禁言该用户");
    //     })
    //     .catch((error) => {
    //       this.$Modal.error(getErrModalOptions(error));
    //     });
        this.userlist[id].in = true;
        this.$Message.info("成功禁言该用户");
    },

    handleOutprison: function (id) {
        this.userlist[id].in = false;
        this.$Message.info("成功解封该用户");
    },

    jumpUserInfo: function (id) {
      this.$router.push({
        name: "user_info",
        params: {
          id: id,
        },
      });
    },
  },
};
</script>

<style lang="less">
.ivu-tabs-tab {
  font-size: 20px;
  font-family: -apple-system, BlinkMacSystemFont, Helvetica Neue, PingFang SC,
    Microsoft YaHei, Source Han Sans SC, Noto Sans CJK SC, WenQuanYi Micro Hei,
    sans-serif;
}
.type-selector {
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 5px;
}
</style>
