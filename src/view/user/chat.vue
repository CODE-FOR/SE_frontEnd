<template>
  <div>
    <!-- <div class="layout-content"> -->
    <Col span="4" style="width: 300px; overflow: auto">
      <Card>
        <p slot="title" style="text-align: center; font-size: 20px">联系人</p>
        <div v-for="item in chatUserList" :key="item.id">
          <Card
            style="padding: 0px; height: 100px"
            @click.native="changeChatUser(item.id, item.name)"
          >
            <i-col span="2" style="type: flex">
              <Avatar
                src="https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png"
                style="width: 300%; height: 300%"
              />
            </i-col>
            <i-col offset="7" style="type: flex">
              <br />
              <p style="font-size: 20px">{{ item.name }}</p>
              <!-- TODO: last message -->
              <div style="color: grey">
                <p>{{ item.lastMessage }}</p>
              </div>
            </i-col>
          </Card>
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
          <From style="position: relative;bottom">
            <From-item key="message">
              <Input
                type="content"
                placeholder="输入聊天内容"
                @keyup.enter.native="sendMessage"
                v-model="sendMes"
              />
              <br />
              <br />
              <Button type="success" @click="sendMessage">发送</Button>
            </From-item>
          </From>
        </Card>
      </div>
    </Col>
  </div>
  <!-- </div> -->
</template>

<script>
import { getUserInfo } from "@/api/user";
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
export default {
  data() {
    return {
      // TODO: use vuex to remember the last chat member
      nowChatUser: 2,
      nowChatUserName: "Captain America",
      showChatUserMessages: [],
      sendMes: "",
      chatUserList: {
        2: {
          id: 2,
          name: "Captain America",
          email: "love3000@love.com",
          lastMessage: "That is American Ass",
        },
        3: {
          id: 3,
          name: "Spider Man",
          email: "wow@beauty.com",
          lastMessage: "",
        },
        5: {
          id: 5,
          name: "Iron Man",
          email: "love3000@love.com",
          lastMessage: "",
        },
        6: {
          id: 6,
          name: "Thor",
          email: "wow@beauty.com",
          lastMessage: "",
        },
        7: {
          id: 7,
          name: "Ant Man",
          email: "wow@beauty.com",
          lastMessage: "",
        },
        8: {
          id: 8,
          name: "Hulk",
          email: "wow@beauty.com",
          lastMessage: "",
        },
        9: {
          id: 9,
          name: "Hawk Eye",
          email: "wow@beauty.com",
          lastMessage: "",
        },
      },
      currentUserId: this.$store.state.user.userId,
      chatMessages: {
        2: [
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
          {
            time: "2021-5-18",
            message: "Bucky is Alive",
            to_id: 2,
            send_id: 3,
          },
          {
            time: "2021-5-18",
            message: "what?",
            to_id: 3,
            send_id: 2,
          },
          {
            time: "2021-5-18",
            message: "That is American Ass",
            to_id: 2,
            send_id: 3,
          },
          {
            time: "2021-5-18",
            message: "Hail Hydra",
            to_id: 2,
            send_id: 3,
          },
        ],
        3: [],
        9: [],
      },
      socket: null,
    };
  },

  created() {
    let _this = this;
    this.socket = new WebSocket("ws://localhost:8080/chat/");
    this.socket.onopen = this.open;
    this.socket.onerror = this.error;
    this.socket.onmessage = this.getMessage;
    window.addEventListener("scroll", this.handleScroll, true);
    window.addEventListener("resize", this.handleResize, true);
  },

  destroyed() {
    let _this = this;
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  },

  async mounted() {
    if (!this.$store.state.user.id) {
      await getUserInfo()
        .then((res) => {
          this.$store.commit("setUserProfile", res.data);
          this.currentUserId = this.$store.state.user.userId
          this.loadChatUser();
          this.loadChatMessage(this.nowChatUser);
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    }
    var he = document.documentElement.clientHeight;
    document.getElementById("chat-content").style.height = he - 262 + "px";
  },

  methods: {
    // TODO: code manage
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
    },

    open: function () {
      console.log("connet successfully");
      this.createUserGroup();
    },

    createUserGroup: function () {
      let chatList = [];
      let user;
      for (user in this.chatUserList) {
        chatList.push(this.chatUserList[user].id);
      }
      let sendmes = {
        code: 700,
        user_id: this.currentUserId,
        chat_list: chatList,
      };
      this.socket.send(JSON.stringify(sendmes));
    },

    error: function () {
      console.log("error");
    },

    /** code:
      *   610:  get_msg
      *   810:  add_new_chat_user
      *         必须判断newUserId是不是currentUserId
      *         因为在后端暂时把发送请求的channel也加入到了userId的group中
      *         因此发送请求的channel也会得到自己的userId，
      *         如果是自己，则不需要做任何处理.
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
          this.chatMessages[destid].push(msgData.msg);
          this.loadChatMessage(destid);
          break;
        case 810:
          let newUserId = msgData.user_id;
          console.log(newUserId)
          if (newUserId !== this.currentUserId) {
            let userId
            let find = false
            for (userId in this.chatUserList) {
              if (userId == newUserId) {
                find = true;
                break;
              }
            }
            if (!find) {
              console.log('get in find')
              // TODO: load User message
              this.$set(this.chatUserList, newUserId,  {
                id: newUserId,
                name: 'fuck me',
                email: 'fuck_me@pornhub.com',
                lastMessage: 'do you want to fuck me?'
              })
              // this.chatUserList[newUserId] =  {
              //   id: newUserId,
              //   name: 'fuck me',
              //   email: 'fuck_me@pornhub.com',
              //   lastMessage: 'do you want to fuck me?'
              // }
              console.log(this.chatUserList[2])
              console.log(this.chatUserList[16])
              // TODO: load chat message about this newUser
              this.chatMessages[newUserId] = []
            }
          }
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

    loadChatUser: function () {},

    /**
     * @description 切换聊天用户
     *    在切换用户之后，需要发送切换到的用户信息
     *    对应后端的接口add_new_chat_user.
     *    防止对方的前端的聊天列表中不包含自己.
     */
    changeChatUser: function (userId, name) {
      this.nowChatUser = userId;
      this.nowChatUserName = name;
      this.loadChatMessage(userId);
      this.socket.send(
        JSON.stringify({
          code: 800,
          user_id: 16,
        })
      );
    },

    loadChatMessage: function (userId) {
      this.showChatUserMessages = this.chatMessages[this.nowChatUser];
      if (
        this.chatMessages[userId] != undefined &&
        this.chatMessages[userId].length > 0
      ) {
        this.chatUserList[userId].lastMessage = this.chatMessages[userId].slice(
          -1
        )[0].message;
        console.log(this.chatUserList[userId].lastMessage);
      }
      this.$nextTick(function () {
        var div = document.getElementById("chat-content");
        div.scrollTop = div.scrollHeight;
      });
    },

    scrollToBottom: function () {
      this.$nextTick(function () {
        alert("get in");
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
.chat-content {
  margin-top: 10px;
  width: 100%;
  padding: 20px;
  // background: rgb(180, 240, 222);
  height: 450px;
  overflow: auto;
  .word {
    display: flex;
    margin-bottom: 60px;

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
        margin-top: 8px;
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
        margin-top: 8px;
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
