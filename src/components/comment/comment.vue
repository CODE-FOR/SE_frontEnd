<template>
  <div>
    <div
      v-for="(item, i) in comments"
      :key="i"
      class="author-title reply-father"
    >
      <Avatar class="header-img" size="default" :src="getImg(item)"></Avatar>
      <div class="author-info">
        <span class="author-name">{{ item.name }}</span>
        <span class="author-time">{{ item.time }}</span>
      </div>
      <!-- 这里是root评论 -->
      <div class="icon-btn">
        <!-- <Button @click="showReplyInput(i, item.name, item.id)">
          <Icon type="ios-chatbubbles" />
          评论{{ false ? item.commentNum : "" }}
        </Button>
        <Poptip
          v-if="item.id === myId"
          confirm
          title="确定要删除吗?删除后将不可恢复。"
          @on-ok="deleteItem(i, reply)"
        >
          <Button> <Icon type="ios-trash" />删除 </Button>
        </Poptip> -->
        <Icon
          :type="dropIconType(item)"
          style="float: right"
          @click="handleShowReply(item)"
        />
      </div>
      <div class="talk-box">
        <p>
          <!-- <span class="reply">{{ item.comment }}</span> -->
          <span class="reply" v-html="item.comment"></span>
        </p>
        <div style="margin-bottom: 35px">
          <Button
            @click="showReplyInput(i, item.name, item.id)"
            style="float: right"
          >
            <Icon type="ios-chatbubbles" />
            评论{{ false ? item.commentNum : "" }}
          </Button>
          <Poptip
            style="float: right"
            v-if="item.id === myId"
            confirm
            title="确定要删除吗?删除后将不可恢复。"
            @on-ok="deleteItem(i, reply)"
          >
            <Button> <Icon type="ios-trash" />删除 </Button>
          </Poptip>
        </div>
      </div>
      <div class="reply-box" v-if="item.showReply">
        <div v-for="(reply, j) in item.reply" :key="j" class="author-title">
          <Avatar
            class="header-img"
            size="default"
            :src="getImg(reply)"
          ></Avatar>
          <div class="author-info">
            <span class="author-name">{{ reply.name }}</span>
            <span class="author-time">{{ reply.time }}</span>
          </div>
          <div class="icon-btn">
            <Button @click="showReplyInput(i, reply.name, reply.id)">
              <Icon type="ios-chatbubbles" />
              评论{{ false ? reply.commentNum : "" }}
            </Button>
            <Poptip
              confirm
              title="确定要删除吗?删除后将不可恢复。"
              @on-ok="deleteReply(i, j)"
            >
              <Button v-if="reply.id === myId">
                <Icon type="ios-trash" />删除
              </Button>
            </Poptip>
          </div>
          <div class="talk-box">
            <p>
              <span>回复 {{ reply.to }}:</span>
              <!-- <span class="reply">{{ reply.comment }}</span> -->
              <span class="reply" v-html="reply.comment"></span>
            </p>
          </div>
          <div class="reply-box"></div>
        </div>
      </div>
      <div v-show="_inputShow(i)" class="my-reply my-comment-reply">
        <Avatar class="header-img" size="default" :src="myHeader"></Avatar>
        <div class="reply-info">
          <div
            tabindex="0"
            contenteditable="true"
            spellcheck="false"
            placeholder="输入评论..."
            @input="onDivInput($event)"
            class="reply-input reply-comment-input"
          ></div>
        </div>
        <div class="reply-btn-box">
          <Button
            class="reply-btn"
            @click="sendCommentReply(i, j)"
            type="primary"
            >发表评论</Button
          >
        </div>
      </div>
    </div>
    <div v-clickoutside="hideReplyBtn" @click="inputFocus" class="my-reply">
      <Avatar class="header-img" size="default" :src="myHeader"></Avatar>
      <div class="reply-info">
        <div
          tabindex="0"
          contenteditable="true"
          id="replyInput"
          spellcheck="false"
          placeholder="输入评论..."
          class="reply-input"
          @focus="showReplyBtn"
          @input="onDivInput($event)"
        ></div>
      </div>
      <div class="reply-btn-box" v-show="btnShow">
        <Button class="reply-btn" @click="sendComment" type="primary"
          >发表评论</Button
        >
      </div>
    </div>
  </div>
</template>
<script>
import { addComment, deleteComment } from "@/api/microknowledge";
import {
  createDiscussionComment,
  deleteDiscussionComment,
} from "@/api/project";
import { getIconById } from "@/api/user";
const clickoutside = {
  // 初始化指令
  bind(el, binding, vnode) {
    function documentHandler(e) {
      // 这里判断点击的元素是否是本身，是本身，则返回
      if (el.contains(e.target)) {
        return false;
      }
      // 判断指令中是否绑定了函数
      if (binding.expression) {
        // 如果绑定了函数 则调用那个函数，此处binding.value就是handleClose方法
        binding.value(e);
      }
    }
    // 给当前元素绑定个私有变量，方便在unbind中可以解除事件监听
    el.vueClickOutside = documentHandler;
    document.addEventListener("click", documentHandler);
  },
  update() {},
  unbind(el, binding) {
    // 解除事件监听
    document.removeEventListener("click", el.vueClickOutside);
    delete el.vueClickOutside;
  },
};
export default {
  name: "ArticleComment",
  props: {
    myHeader: {
      type: String,
      default:
        "https://ae01.alicdn.com/kf/Hd60a3f7c06fd47ae85624badd32ce54dv.jpg",
    },
    myId: {
      type: Number,
      default: 19870621,
    },
    comments_init: {
      type: Array,
      default: function () {
        return [];
      },
    },
    micro_knowledge_id: {
      type: Number,
      default: 0,
    },
    commentType: {
      type: Number,
      default: 0,
    },
  },

  mounted() {
    this.initComments();
  },

  computed: {},

  data() {
    return {
      btnShow: false,
      index: "0",
      replyComment: "",
      myName: this.$store.state.user.userName,
      to: "",
      toId: -1,
      comments: [],
      totalCommentNum: 0,
    };
  },
  directives: { clickoutside },
  methods: {
    initComments() {
      let mapData = this.comments_init.map((item) => {
        this.totalCommentNum++;
        this.totalCommetnNum += item.reply.length;
        return {
          comment: item.comment,
          commentId: item.commentId,
          headImg: item.headImg,
          id: item.id,
          inputShow: item.inputShow,
          name: item.name,
          parent_comment_id: item.parent_comment_id,
          reply: item.reply,
          time: item.time,
          to: item.to,
          toId: item.toId,
          showReply: false,
        };
      });
      this.comments.push(...mapData.filter((x) => x));
      console.log(this.comments);
    },

    dropIconType(item) {
      return item.showReply ? "ios-arrow-up" : "ios-arrow-down";
    },

    inputFocus() {
      var replyInput = document.getElementById("replyInput");
      replyInput.style.padding = "8px 8px";
      replyInput.style.border = "2px solid blue";
      replyInput.focus();
    },
    showReplyBtn() {
      this.btnShow = true;
    },
    hideReplyBtn() {
      this.btnShow = false;
      replyInput.style.padding = "10px";
      replyInput.style.border = "none";
    },
    showReplyInput(i, name, id) {
      this.comments[this.index].inputShow = false;
      this.index = i;
      this.comments[i].inputShow = true;
      this.to = name;
      this.toId = id;
    },
    _inputShow(i) {
      return this.comments[i].inputShow;
    },
    deleteItem(i) {
      const delete_function =
        this.commentType === 0 ? deleteComment : deleteDiscussionComment;
      delete_function("post", {
        id: this.comments[i].commentId,
      })
        .then((res) => {
          this.comments.splice(i, 1);
          this.$Message.success("删除成功！");
        })
        .catch((err) => {
          console.log(err);
          this.$Message.success("删除失败!");
        });
    },
    deleteReply(i, j) {
      const delete_function =
        this.commentType === 0 ? deleteComment : deleteDiscussionComment;
      delete_function("post", {
        id: this.comments[i].reply[j].commentId,
      })
        .then((res) => {
          this.comments[i].reply.splice(j, 1);
          this.$Message.success("删除成功！");
        })
        .catch((err) => {
          console.log(err);
          this.$Message.success("删除失败!");
        });
    },

    handleShowReply(item) {
      item.showReply = !item.showReply;
    },

    sendComment() {
      if (!this.replyComment) {
        this.$message({
          showClose: true,
          type: "warning",
          message: "评论不能为空",
        });
      } else {
        let a = {};
        let input = document.getElementById("replyInput");
        let timeNow = new Date().getTime();
        let time = this.dateStr(timeNow);
        a.name = this.myName;
        a.id = this.myId;
        a.comment = this.replyComment;
        a.headImg = this.myHeader;
        a.time = time;
        a.reply = [];
        a.commentNum = 0;
        a.like = 0;
        if (this.commentType === 0) {
          addComment("post", {
            micro_knowledge_id: this.micro_knowledge_id,
            content: a.comment,
          })
            .then((res) => {
              this.$Message.success("评论成功!");
              console.log(res);
              a.commentId = res.data.id;
              this.comments.push(a);
              this.replyComment = "";
              input.innerHTML = "";
            })
            .catch((err) => {
              console.log(err);
              this.$Message.error("评论失败!");
            });
        } else {
          createDiscussionComment({
            topic_id: this.micro_knowledge_id,
            content: a.comment,
          })
            .then((res) => {
              this.$Message.success("评论成功!");
              console.log(res);
              a.commentId = res.data.id;
              this.comments.push(a);
              this.replyComment = "";
              input.innerHTML = "";
            })
            .catch((err) => {
              console.log(err);
              this.$Message.error("评论失败!");
            });
        }
      }
    },
    getImg(item) {
      console.log(item.id);
      if (item.headImg == "") {
        getIconById({
          id: item.id,
        }).then((res) => {
          item.headImg = res.data.icon;
          return item.headImg;
        });
      } else {
        return item.headImg;
      }
    },
    sendCommentReply(i, j) {
      if (!this.replyComment) {
        this.$message({
          showClose: true,
          type: "warning",
          message: "评论不能为空",
        });
      } else {
        let a = {};
        let timeNow = new Date().getTime();
        let time = this.dateStr(timeNow);
        a.name = this.myName;
        a.to = this.to;
        a.id = this.myId;
        a.headImg = this.myHeader;
        a.comment = this.replyComment;
        a.time = time;
        a.commentNum = 0;
        a.like = 0;
        if (this.commentType === 0) {
          addComment("post", {
            micro_knowledge_id: this.micro_knowledge_id,
            content: a.comment,
            parent_comment_id: this.comments[i].commentId,
            to_user_id: this.toId,
          })
            .then((res) => {
              this.$Message.success("评论成功!");
              console.log(res);
              a.commentId = res.data.id;
              this.comments[i].reply.push(a);
              this.replyComment = "";
              document.getElementsByClassName("reply-comment-input")[
                i
              ].innerHTML = "";
            })
            .catch((err) => {
              console.log(err);
              this.$Message.error("评论失败!");
            });
        } else {
          createDiscussionComment({
            topic_id: this.micro_knowledge_id,
            content: a.comment,
            parent_discussion_id: this.comments[i].commentId,
            to_user_id: this.toId,
          })
            .then((res) => {
              this.$Message.success("评论成功!");
              console.log(res);
              a.commentId = res.data.id;
              this.comments[i].reply.push(a);
              this.replyComment = "";
              document.getElementsByClassName("reply-comment-input")[
                i
              ].innerHTML = "";
            })
            .catch((err) => {
              console.log(err);
              this.$Message.error("评论失败!");
            });
        }
      }
    },
    onDivInput: function (e) {
      this.replyComment = e.target.innerHTML;
    },
    dateStr(date) {
      // 获取js 时间戳
      var time = new Date().getTime();
      // 去掉 js 时间戳后三位，与php 时间戳保持一致
      time = parseInt((time - date) / 1000);
      // 存储转换值
      var s;
      if (time < 60 * 10) {
        // 十分钟内
        return "刚刚";
      } else if (time < 60 * 60 && time >= 60 * 10) {
        // 超过十分钟少于1小时
        s = Math.floor(time / 60);
        return s + "分钟前";
      } else if (time < 60 * 60 * 24 && time >= 60 * 60) {
        // 超过1小时少于24小时
        s = Math.floor(time / 60 / 60);
        return s + "小时前";
      } else if (time < 60 * 60 * 24 * 30 && time >= 60 * 60 * 24) {
        // 超过1天少于30天内
        s = Math.floor(time / 60 / 60 / 24);
        return s + "天前";
      } else {
        // 超过30天ddd
        date = new Date(parseInt(date));
        return (
          date.getFullYear() +
          "/" +
          (date.getMonth() + 1) +
          "/" +
          date.getDate()
        );
      }
    },
  },
};
</script>

<style>
.my-reply {
  padding: 10px;
  background-color: #fafbfc;
}

.my-reply .header-img {
  display: inline-block;
  vertical-align: top;
}

.my-reply .reply-info {
  display: inline-block;
  margin-left: 5px;
  width: 90%;
}

@media screen and (max-width: 1200px) {
  .my-reply .reply-info {
    width: 80%;
  }
}

.my-reply .reply-info .reply-input {
  min-height: 20px;
  line-height: 22px;
  padding: 10px 10px;
  color: #ccc;
  background-color: #fff;
  border-radius: 5px;
}

.my-reply .reply-info .reply-input:empty:before {
  content: attr(placeholder);
}

.my-reply .reply-info .reply-input:focus:before {
  content: none;
}

.my-reply .reply-info .reply-input:focus {
  padding: 8px 8px;
  border: 2px solid #00f;
  box-shadow: none;
  outline: none;
}

.my-reply .reply-btn-box {
  height: 25px;
  margin: 10px 0;
}

.my-reply .reply-btn-box .reply-btn {
  position: relative;
  float: right;
  margin-right: 15px;
}

.my-comment-reply {
  margin-left: 50px;
}

.my-comment-reply .reply-input {
  width: flex;
}

.author-title:not(:last-child) {
  border-bottom: 1px solid rgba(178, 186, 194, 0.3);
}

.author-title {
  padding: 10px;
}

.author-title .header-img {
  display: inline-block;
  vertical-align: top;
}

.author-title .author-info {
  display: inline-block;
  margin-left: 5px;
  width: 60%;
  height: 40px;
  line-height: 20px;
}

.author-title .author-info > span {
  display: block;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.author-title .author-info .author-name {
  color: #000;
  font-size: 18px;
  font-weight: bold;
}

.author-title .author-info .author-time {
  font-size: 14px;
}

.author-title .icon-btn {
  width: 30%;
  padding: 0 !important;
  float: right;
}

@media screen and (max-width: 1200px) {
  .author-title .icon-btn {
    width: 20%;
    padding: 7px;
  }
}

.author-title .icon-btn > span {
  cursor: pointer;
}

.author-title .icon-btn .iconfont {
  margin: 0 5px;
}

.author-title .talk-box {
  margin: 0 50px;
  /* width: 70%; */
}

.author-title .talk-box > p {
  margin: 0;
}

.author-title .talk-box .reply {
  font-size: 16px;
  color: #000;

  word-break: break-all;
}

.author-title .reply-box {
  margin: 10px 0 0 50px;
  background-color: #efefef;
}
</style>
