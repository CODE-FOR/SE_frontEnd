<template>
  <Row>
    <i-col offset="4" span="15">
      <Card>
        <Tabs value="userList" @on-click="changeTab" :animated="false">
          <TabPane label="用户列表" name="userList">
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
                      Ta的主页
                    </i-button>
                    &nbsp;&nbsp;
                    <template v-if="item.in === false">
                      <i-button
                        type="primary"
                        style="width: 40%; height: 35px; top: 31px; position: relative"
                        @click="handleImprison(item.id, index)"
                      >
                        关进小黑屋
                      </i-button>
                    </template>
                    <template v-else>
                      <i-button
                        type="primary"
                        style="width: 40%; height: 35px; top: 31px; position: relative"
                        @click="handleOutprison(item.id, index)"
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
                  show-elevator
                />
              </div>
            </template>
          </TabPane>
          <TabPane label="封禁用户列表" name="userIn">
            <template v-if="userIn.length !== 0">
              <div v-for="(item, index) in userIn" :key="index">
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
                      Ta的主页
                    </i-button>
                    &nbsp;&nbsp;
                    <template v-if="item.in === false">
                      <i-button
                        type="primary"
                        style="width: 40%; height: 35px; top: 31px; position: relative"
                      >
                        已解封
                      </i-button>
                    </template>
                    <template v-else>
                      <i-button
                        type="primary"
                        style="width: 40%; height: 35px; top: 31px; position: relative"
                        @click="handleOutprison(item.id, index)"
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
                  :total="prisonTotalCnt"
                  :page-size="prisonPageSize"
                  :current="prisonPageIndex"
                  @on-change="changePrisonPage"
                  show-elevator
                />
              </div>
            </template>
            <template v-else>
              <div align="center">
                无禁言用户
              </div>
            </template>
          </TabPane>
        </Tabs>
      </Card>
    </i-col>
  </Row>
</template>

<script>
import UserCard from "@/view/user/user-card";
import { prisonOut, prisonIn, getUserList, getPrisonList } from "@/api/user";
import {getUserInfo} from "../../api/user";
import {forEach} from "../../libs/tools";
export default {
  name: "home",

  components: { UserCard },

  data() {
    return {
      userlist: [
        /*
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

         */
      ],
      pageIndex: 1,
      totalCnt: 0,
      pageSize: 5,
      userIn: [],
      prisonPageIndex: 1,
      prisonTotalCnt: 0,
      prisonPageSize: 5
    };
  },

  mounted() {
    this.getUserList();
    this.getPrisonList();
  },

  methods: {
    getUserList: function () {
      getUserList(this.pageIndex, "get").then((res) => {
        this.userlist = [];
        this.totalCnt = res.data.total_page * 5;
        const mapData = res.data.user_list.map((item) => {
          return {
            id: item.user_id,
            username: item.user_name,
            nick_name: "",
            email: item.email,
            in: item.is_banned
          }
        });
        this.userlist.push(...mapData.filter((x) => x));
      });
    },

    getPrisonList: function () {
      getPrisonList(this.prisonPageIndex, "get").then((res) => {
        this.userIn = [];
        this.prisonTotalCnt = res.data.total_page * 5;
        const mapData = res.data.ban_list.map((item) => {
          return {
            id: item.user_id,
            username: item.user_name,
            nick_name: "",
            email: item.email,
            in: true,
            reason: item.reason
          }
        });
        this.userIn.push(...mapData.filter((x) => x));
      });
    },

    changePage: function (i) {
      // this.$store.commit("setHomePage", i);
      this.userlist = [];
      setTimeout(() => {
        document
          .getElementsByClassName("content-wrapper ivu-layout-content")[0]
          .scroll(0, 0);
      }, 400);
      this.pageIndex = i;
      this.getUserList();
    },

    changePrisonPage: function (i) {
      // this.$store.commit("setHomePage", i);
      this.userIn = [];
      setTimeout(() => {
        document
          .getElementsByClassName("content-wrapper ivu-layout-content")[0]
          .scroll(0, 0);
      }, 400);
      this.prisonPageIndex = i;
      this.getPrisonList();
    },

    handleImprison: function (id, index) {
      const data = {
        userId: id,
        reason: ""
      };
      prisonIn(data)
        .then((res) => {
          this.$Message.info("成功禁言该用户");
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
      this.userlist[index].in = true;
      // this.$Message.info("成功禁言该用户");
    },

    handleOutprison: function (id, index) {
      const data = {
        userId: id
      };
      prisonOut(data)
        .then((res) => {
          this.$Message.info("成功解封该用户");
        })
        .catch((error) => {
         this.$Modal.error(getErrModalOptions(error));
      });
      this.userlist[index].in = false;
    },

    jumpUserInfo: function (id) {
      this.$router.push({
        name: "user_info",
        params: {
          id: id,
        },
      });
    },

    changeTab: function (name) {
      // name in ["recommend", "favorite"]
      this.activeTab = name;
      this.pageIndex = 1;
      this.prisonPageIndex = 1;
      // this.$store.commit("setHomePage", 1);
      // this.pageComponent.items = [];
      if (this.activeTab === "userList") {
        this.getUserList();
      } else {
        this.getPrisonList();
      }
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
