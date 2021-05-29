<template>
  <div>
    <!-- <div class="layout-content"> -->
    <Col span="4" style="width: 300px; overflow: auto">
      <Card>
        <p slot="title" style="text-align: center; font-size: 20px">联系人</p>
        <Form @submit.native.prevent inline>
          <FormItem prop="user">
            <Input
              type="text"
              placeholder="联系人姓名"
              @keyup.enter.native="handleFindMember"
              v-model="findMemberName"
            >
              <Icon type="ios-person-outline" slot="prepend"></Icon>
            </Input>
          </FormItem>
          <FormItem>
            <Button type="primary" @click="handleFindMember">
              <Icon type="ios-search-outline" />
            </Button>
          </FormItem>
        </Form>
        <div v-for="item in chatUserIdList" :key="item">
          <div :ref="chatUserList[item].name" :id="item">
            <Card
              style="padding: 0px; height: 100px"
              @click.native="
                changeChatUser(chatUserList[item].id, chatUserList[item].name)
              "
            >
              <i-col span="2" style="type: flex">
                <img
                  :src="chatUserList[item].icon"
                  style="width: 300%; height: 300%;vertical-align:top;border-radius:50%"
                />
              </i-col>
              <i-col offset="7" style="type: flex">
                <Badge
                  :count="chatUserList[item].unreadMessageNum"
                  style="margin-left: 150px"
                >
                  <a href="#" class="demo-badge"></a>
                </Badge>
                <br />
                <p
                  style="font-size: 20px"
                  :ref="`member${chatUserList[item].id}`"
                  class="member-card"
                >
                  {{ chatUserList[item].name }}
                </p>
                <!-- TODO: last message -->
                <div style="color: grey">
                  <p>{{ chatUserList[item].lastMessage }}</p>
                </div>
              </i-col>
            </Card>
          </div>
        </div>
      </Card>
    </Col>
    <Col offset="4" span="12">
      <div
        class="layout-content-main"
        style="position: fixed; width: 50%"
        id="fix-content"
      >
        <Card>
          <p slot="title" style="text-align: center; font-size: 20px">
            {{ nowChatUserName }}
          </p>
          <div class="chat-content" id="chat-content">
            <!-- recordContent 聊天记录数组-->
            <div v-for="(itemc, indexc) in showChatUserMessages" :key="indexc">
              <!-- 对方 -->
              <div class="word" v-if="itemc.send_id !== currentUserId">
                <!-- <img :src="itemc.headUrl" /> -->
                <div class="info">
                  <!-- <p class="time">
                    {{ itemc.nickName }}
                  </p> -->
                  <div class="info-content">{{ itemc.message }}</div>
                  <div class="message_time">
                    {{ itemc.time }}
                  </div>
                </div>
              </div>
              <!-- 我的 -->
              <div class="word-my" v-else>
                <div class="info">
                  <div class="info-content">{{ itemc.message }}</div>
                  <div class="Sender_time">
                    {{ itemc.time }}
                  </div>
                </div>
                <!-- <img :src="itemc.headUrl" /> -->
              </div>
            </div>
          </div>
          <Form style="position: relative;bottom" @submit.native.prevent>
            <FormItem key="message">
              <Input
                type="content"
                placeholder="输入聊天内容"
                @keyup.enter.native="sendMessage"
                v-model="sendMes"
              />
              <br />
              <br />
              <Button type="success" @click="sendMessage">发送</Button>
            </FormItem>
          </Form>
        </Card>
      </div>
    </Col>
  </div>
  <!-- </div> -->
</template>

<script>
import { getUserInfo } from "@/api/user";
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
import {
  getChatUserList,
  addUsrToChatList,
  clearUnread,
  getChatUser,
  getChatMessages,
} from "@/api/chat.js";
export default {
  data() {
    return {
      nowChatUser: 0,
      findMemberName: "",
      nowChatUserName: "xxxx",
      showChatUserMessages: [],
      sendMes: "",
      chatUserIdList: [],
      // chatUserList: {
      //   3: {
      //     id: 3,
      //     name: "Captain America",
      //     email: "love3000@love.com",
      //     lastMessage: "That is American Ass",
      //     haveUnreadMessage: true,
      //     unreadMessageNum: 2,
      //   },
      //   4: {
      //     id: 4,
      //     name: "Cap",
      //     email: "love3000@love.com",
      //     lastMessage: "That is American Ass",
      //     haveUnreadMessage: false,
      //     unreadMessageNum: 0,
      //   },
      // },
      chatUserList: {},
      currentUserId: this.$store.state.user.userId,
      chatMessages: {
        3: [
          {
            time: "2021-5-18",
            message: "I can do this all day",
            to_id: 3,
            send_id: 2,
          },
          {
            time: "2021-5-18",
            message: "yeah, I know",
            to_id: 2,
            send_id: 3,
          },
        ],
      },
      socket: null,
    };
  },

  created() {
    let _this = this;
    // this.socket = new WebSocket("ws://localhost:8080/chat/");
    this.socket = new WebSocket("ws://114.115.156.182:8080/chat/");
    this.socket.onopen = this.open;
    this.socket.onerror = this.error;
    this.socket.onmessage = this.getMessage;
    window.addEventListener("scroll", this.handleScroll, true);
    window.addEventListener("resize", this.handleResize, true);
  },

  destroyed() {
    this.clearUnreadMessage(this.nowChatUser);
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  },

  async mounted() {
    if (!this.$store.state.user.id) {
      await getUserInfo()
        .then((res) => {
          this.$store.commit("setUserProfile", res.data);
          this.currentUserId = this.$store.state.user.userId;
          this.initialGetChatUserList();
        })
        .catch((error) => {
          // this.$Modal.error(getErrModalOptions(error));
        });
    }
    var he = document.documentElement.clientHeight;
    document.getElementById("chat-content").style.height = he - 262 + "px";
  },

  methods: {
    sendMessage: function () {
      let sendmes = {
        msg: {
          message: this.sendMes,
          time: "2021-05-21",
        },
        code: 600,
        receiver_id: this.nowChatUser,
        sender_id: this.currentUserId,
      };
      this.socket.send(JSON.stringify(sendmes));
      this.sendMes = "";
    },

    handleFindMember: function () {
      if (this.$refs[this.findMemberName] == undefined) {
        this.$Message.warning("抱歉，未找到该联系人");
      } else {
        let userId = this.$refs[this.findMemberName][0].id;
        this.changeChatUser(userId, this.chatUserList[userId].name);
      }
    },

    open: function () {
      console.log("connet successfully");
      this.createUserGroup();
    },

    createUserGroup: function () {
      let sendmes = {
        code: 700,
        user_id: this.currentUserId,
      };
      this.socket.send(JSON.stringify(sendmes));
    },

    error: function () {
      console.log("error");
    },

    /** code:
     *   610: @description 接收到新消息
     *                     判断sender是否为自己，
     *                     为自己，将msg添加到receiver_id的chatMessage中。
     *                     否则判断sender_id是否存在于chatList中，
     *                     不存在要添加。
     */
    getMessage: function (msg) {
      let msgData = JSON.parse(msg.data);
      msgData = msgData.message;
      let code = msgData.code;
      switch (code) {
        case 610:
          let senderid = msgData.sender_id;
          let receiverid = msgData.receiver_id;
          let destid = senderid;
          if (destid === this.currentUserId) {
            destid = receiverid;
          }
          let userId;
          let find = false;
          for (userId in this.chatUserList) {
            if (userId == destid) {
              find = true;
              break;
            }
          }
          if (!find) {
            // TODO: load User message, in then use setUnreadMessage
            this.chatUserIdList.splice(0, 0, destid);
            this.$set(this.chatUserIdList, 0, destid);
            this.$set(this.chatUserList, destid, {
              id: destid,
              name: "loading...",
              email: "loading...",
              lastMessage: "loading...",
              haveUnreadMessage: false,
              unreadMessageNum: 0,
            });
            this.getNewChatUserMessage(destid);
            this.chatMessages[destid] = [];
          } else {
            let i;
            for (i = 0; i < this.chatUserIdList.length; i++) {
              if (this.chatUserIdList[i] == userId) {
                break;
              }
            }
            let tmp = this.chatUserIdList[i];
            this.chatUserIdList[i] = this.chatUserIdList[0];
            this.chatUserIdList[0] = tmp;
          }
          this.chatMessages[destid].push(msgData.msg);
          this.loadChatMessage(destid);
          this.setUnreadMessage(destid);
          break;
      }
    },

    setUnreadMessage: function (userId, mode) {
      if (userId != this.nowChatUser) {
        this.chatUserList[userId].haveUnreadMessage = true;
        this.chatUserList[userId].unreadMessageNum += 1;
      }
    },

    handleScroll: function () {
      var sl = Math.max(
        document.body.scrollLeft,
        document.documentElement.scrollLeft
      );
      document.getElementById("fix-content").style.left = 600 - sl + "px";
    },

    handleResize: function () {
      var he = document.documentElement.clientHeight;
      document.getElementById("chat-content").style.height = he - 262 + "px";
    },

    loadChatUserList: function () {
      getChatUserList()
        .then((res) => {
          this.chatUserList = {};
          this.chatUserIdList = res.data.id_list;
          res.data.chat_user_list.map((item) => {
            this.$set(this.chatUserList, item.id, {
              id: item.id,
              name: item.name,
              email: item.email,
              lastMessage: "Loading",
              haveUnreadMessage: item.have_unread_message,
              unreadMessageNum: item.unread_message_num,
              icon: item.icon,
            });
            this.chatMessages[item.id] = [];
            // this.chatUserList[item.id] = {};
          });
          this.loadChatMessageList();
          this.$nextTick(function () {
            this.changeChatUser(
              this.chatUserIdList[0],
              this.chatUserList[this.chatUserIdList[0]].name
            );
          });
        })
        .catch((error) => {
          // this.$Modal.error(getErrModalOptions(error));
        });
    },

    loadChatMessageList: function () {
      getChatMessages().then((res) => {
        this.chatMessages = res.data.message_list;
        let userId;
        for (userId in this.chatUserIdList) {
          this.loadChatMessage(this.chatUserIdList[userId]);
        }
      });
    },

    /**
     * @description: 获取用户列表
     * 首先要确定是否有新加入用户进入聊天列表。
     */
    initialGetChatUserList: function () {
      if (this.$route.params.userId) {
        addUsrToChatList({
          user_id: this.$route.params.userId,
        })
          .then((res) => {
            this.loadChatUserList();
          })
          .catch((error) => {
            // this.$Modal.error(getErrModalOptions(error));
          });
      } else {
        this.loadChatUserList();
      }
    },

    // TODO: 测试后消除注释
    clearUnreadMessage: function (userId) {
      clearUnread({
        user_id: userId,
      })
        .then((res) => {
          this.chatUserList[userId].unreadMessageNum = 0;
          this.chatUserList[userId].haveUnreadMessage = false;
        })
        .catch((error) => {
          // this.$Modal.error(getErrModalOptions(error));
        });
    },

    getNewChatUserMessage: function (userId) {
      getChatUser({
        user_id: userId,
      })
        .then((res) => {
          this.chatUserList[userId].id = res.data.chat_user.id;
          this.chatUserList[userId].name = res.data.chat_user.name;
          this.chatUserList[userId].email = res.data.chat_user.email;
        })
        .catch((error) => {
          // this.$Modal.error(getErrModalOptions(error));
        });
    },

    /**
     * @description 切换聊天用户
     * 调用了两次clearUnreadMessage
     * 第一次调用是因为要清除切换之前正在聊天的用户的未读记录，
     * 因为在和当前用户聊天的时候，一直是在用前端处理unreadMessage，
     * 当用户为正在聊天用户的时候，接收到新的消息不做setUnreadMessage,
     * 但是后端依旧将unreadMessage数量递增。因此需要在切换前做一次通信。
     * 同理，在destory方法中调用也是为了通信做同步。
     * 第二次是清除切换到的，显而易见。
     */
    changeChatUser: function (userId, name) {
      if (this.nowChatUser === 0) {
        this.nowChatUser = userId;
        this.nowChatUserName = name;
        this.$refs[`member${userId}`][0].style.color = "black";
        this.loadChatMessage(userId);
        this.clearUnreadMessage(this.nowChatUser);
        return;
      }
      let i;
      for (i = 0; i < this.chatUserIdList.length; i++) {
        if (this.chatUserIdList[i] == userId) {
          break;
        }
      }
      this.chatUserIdList.splice(i, 1);
      this.chatUserIdList.splice(0, 0, userId);
      this.$refs[`member${this.nowChatUser}`][0].style.color = "darkgrey";
      this.clearUnreadMessage(this.nowChatUser);
      this.nowChatUser = userId;
      this.nowChatUserName = name;
      this.$refs[`member${userId}`][0].style.color = "black";
      this.loadChatMessage(userId);
      this.clearUnreadMessage(this.nowChatUser);
    },

    loadChatMessage: function (userId) {
      this.showChatUserMessages = this.chatMessages[this.nowChatUser];
      if (
        this.chatMessages[userId] != undefined &&
        this.chatMessages[userId].length > 0
      ) {
        let tmp = this.chatMessages[userId].slice(-1)[0].message;
        if (tmp.length > 8) {
          tmp = tmp.substring(0, 8) + "...";
        }
        this.chatUserList[userId].lastMessage = tmp;
      } else {
        this.chatMessages[userId] = [];
      }
      this.$nextTick(function () {
        var div = document.getElementById("chat-content");
        div.scrollTop = div.scrollHeight;
      });
    },

    scrollToBottom: function () {
      this.$nextTick(function () {
        var div = document.getElementById("chat-content");
        div.scrollTop = div.scrollHeight;
      });
    },
  },

  watch: {
    showChatUserMessages: "scroolToBottom",
  },
};
</script>

<style lang="less">
body {
  overflow: auto;
}
#app {
  min-width: 1500px;
}
.member-card {
  color: darkgray;
}
.chat-content {
  margin-top: 10px;
  width: 100%;
  padding: 20px;
  // background: rgb(180, 240, 222);
  height: 450px;
  overflow: auto;
  .word {
    display: flex;
    margin-bottom: 40px;

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .info {
      width: 47%;
      margin-left: 10px;
      .message_time {
        font-size: 12px;
        color: rgba(51, 51, 51, 0.8);
        margin: 0;
        height: 20px;
        line-height: 20px;
        margin-top: -5px;
        margin-top: 5px;
      }
      .info-content {
        word-break: break-all;
        display: inline-block;
        padding: 10px;
        font-size: 14px;
        background: #fff;
        position: relative;
        margin-top: -30px;
        background: #dbdbdb;
        border-radius: 4px;
      }
      .info-content::before {
        position: absolute;
        left: -8px;
        top: 8px;
        content: "";
        border-right: 10px solid #dbdbdb;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
      }
    }
  }

  .word-my {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 60px;
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .info {
      width: 90%;
      text-align: right;
      display: flex;
      align-items: flex-end;
      flex-wrap: wrap;
      flex-direction: column;
      .info-content {
        word-break: break-all;
        max-width: 45%;
        padding: 10px;
        font-size: 14px;
        margin-right: 10px;
        position: relative;
        margin-top: -30px;
        background: #a3c3f6;
        text-align: left;
        border-radius: 4px;
      }
      .Sender_time {
        padding-right: 12px;
        padding-top: 5px;
        font-size: 12px;
        color: rgba(51, 51, 51, 0.8);
        margin: 0;
        height: 20px;
      }
      .info-content::after {
        position: absolute;
        right: -8px;
        top: 8px;
        content: "";
        border-left: 10px solid #a3c3f6;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
      }
    }
  }
}
</style>
