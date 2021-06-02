<template>
  <div>
    <div class="ivu-card-head">
      <!-- <template v-if="kind === 1"> -->
      <h2><div v-html="title"/></h2>
      <!-- </template> -->
    </div>
    <card :bordered="false" dis-hover :style="citeStyle">
      <div slot="title">
        发布者:
        <a @click.prevent="showUser" :id="id">{{
          creator["username"] === "" ? "未知用户" : creator["username"]
        }}</a>
        <Modal v-model="showUserControl" footer-hide>
          <Row>
            <i-col span="4">
              <img
                :src="userInfo.icon"
                style="
                  width: 90%;
                  height: 90%;
                  vertical-align: top;
                  border-radius: 50%;
                "
                shape="square"
              />
            </i-col>
            <i-col span="10">
              <div class="user-name">
                {{ userInfo.username }}
              </div>
              <p style="margin-top: 5px">
                邮箱: {{ userInfo.email || "暂无邮箱信息" }}
              </p>
              <p>所属组织: {{ userInfo.institution || "暂无组织信息" }}</p>
            </i-col>
          </Row>
          <Divider />
          <Row>
            <i-col span="8" style="text-align: center; font-size: 18px">
              <p class="data-title">总发布数</p>
              <p>{{ userInfo.total_post }}</p>
            </i-col>
            <i-col span="8" style="text-align: center; font-size: 18px">
              <p class="data-title">总粉丝数</p>
              <p>{{ userInfo.total_fan }}</p>
            </i-col>
            <i-col span="8" style="text-align: center; font-size: 18px">
              <p class="data-title">总点赞数</p>
              <p>{{ userInfo.total_like }}</p>
            </i-col>
          </Row>
          <Divider />
          <Row>
            <i-col span="7" offset="4">
              <i-button
                v-if="!userInfo.is_following"
                style="width: 100%"
                @click="handleFollow"
              >
                关注
              </i-button>
              <i-button
                v-else
                style="width: 100%"
                type="primary"
                @click="handleFollow"
              >
                取消关注
              </i-button>
            </i-col>
            <i-col span="7" offset="2">
              <i-button
                type="primary"
                style="width: 100%"
                @click="jumpUserInfo(userInfo.id)"
              >
                他的主页
              </i-button>
            </i-col>
          </Row>
        </Modal>
      </div>
      <p slot="extra">论文解读发布于: {{ createAt }}</p>
      <Row v-html="content"></Row>
      <br />
      <Row>
        <Tag v-for="(tag, index) in tags" :key="index" class="sysTopics">{{
          tag.name
        }}</Tag>
      </Row>
      <br />
      <Row>
        <i-col span="12">
          <template v-if="isAdmin === 0">
            <ButtonGroup>
              <i-button @click="onLike" style="font-size: 14px">
                <Icon type="md-thumbs-up" :color="likeColor" />
                点赞 {{ likeNumber }}
              </i-button>
              <i-button @click="onCollect" style="font-size: 14px">
                <Icon :type="collectType" :color="collectColor" />
                收藏 {{ favorNumber }}
              </i-button>
              <template v-if="isInDetail === 1">
                <i-button @click="setReport" style="font-size: 14px">
                  举报
                </i-button>
                <i-button @click="onComment" style="font-size: 14px">
                  <Icon type="ios-chatbubbles" />
                  评论 {{ totalCommentNum }}
                </i-button>
              </template>
              <template v-if="isInDetail === 0">
                <i-button
                  @click="handleJumpInterpretation"
                  style="font-size: 14px"
                >
                  <Icon type="ios-more" />
                  查看详细内容
                </i-button>
              </template>
            </ButtonGroup>
            <br />
            <br />
            <!--
            <template v-if="this.showReportReason === true">
              举报理由：{{ this.reportReason }}
            </template>
            -->
            <template v-if="isReported === true">
              <Form
                ref="reportHandle"
                :model="reportHandle"
                :rules="ruleCustom"
                :label-width="100"
              >
                <Form-item label="举报理由：" prop="reportExplanation"
                ><Input
                  type="text"
                  v-model="reportHandleReason"
                  placeholder="请输入"
                /></Form-item>
              </Form>
              <div align="center">
                <i-button @click="onReport" style="font-size: 14px">
                  确认举报
                </i-button>
              </div>
            </template>
            <template v-else></template>
          </template>
          <template v-else>
            <i-button @click="deleteInterpretation" style="font-size: 14px">
              删除
            </i-button>
          </template>
        </i-col>
      </Row>
      <Card v-if="showComment" style="margin-top: 10px">
        <comment v-bind="comments"></comment>
      </Card>
    </card>
    <Divider />
  </div>
</template>

<script>
import {
  favorMicroKnowledge,
  likeMicroKnowledge,
  getMicroknowledgeComments,
  microKnowledgeIdReq,
  reportInterpretation
} from "@/api/microknowledge.js";
import { follow, unfollow, getUserInfo, getIconById } from "@/api/user";
import { getErrModalOptions, getLocalTime } from "@/libs/util";
import comment from "@/components/comment/comment.vue";
import {
  likeInterpretation,
  collectInterpretation,
} from "../../api/microknowledge";
import paramsVue from '../login/argu-page/params.vue';
export default {
  name: "KnowledgeCard",
  components: {
    comment,
  },
  props: {
    reportReason: {
      type: String,
      default: "",
    },

    showReportReason: {
      type: Boolean,
      default: false,
    },

    reportExplanation: {
      type: String,
      default: "",
    },

    isAdmin: {
      type: Number,
      default: 0,
    },

    isInDetail: {
      type: Number,
      default: 0,
    },

    id: {
      type: Number,
      default: 0,
    },

    title: {
      type: String,
      default: "title",
    },

    tags: {
      type: Array,
      default: () => {
        return [];
      },
    },

    creator: {
      type: Object,
      default: () => {
        return {
          username: "xx",
          id: "0",
        };
      },
    },

    createAt: {
      type: String,
      default: "年/月/日",
    },

    content: {
      type: String,
      default: "这是一个展示示例",
    },

    isLike: {
      type: Boolean,
      default: false,
    },

    isCollect: {
      type: Boolean,
      default: false,
    },

    // 举报
    isReported: {
      type: Boolean,
      default: false,
    },

    likeNumber: {
      type: Number,
      default: 0,
    },

    favorNumber: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      showComment: false,
      comments: [],
      detailController: false,
      showUserControl: false,
      userInfo: {},
      totalCommentNum: 0,
      reportHandleReason: "",
    };
  },

  computed: {
    likeColor: function () {
      return this.isLike ? "#0084ff" : "#747b8b";
    },

    collectType: function () {
      return this.isCollect ? "ios-heart" : "ios-heart-outline";
    },

    collectColor: function () {
      return this.isCollect ? "#fb7299" : "default";
    },

    reportColor: function () {
      return this.isReported ? "#fb0316" : "#747b8b";
    },

    citeStyle: function () {
      return this.cite ? "margin-left:100px;" : "";
    },

    popId: function () {
      return "pop" + this.id;
    },
  },

  mounted() {
    this.getComments();
  },

  methods: {
    // TODO: need to be finished!!! -> administrator delete
    deleteInterpretation: function () {},

    setReport: function() {
      this.isReported = !this.isReported;
    },

    onReport: function () {
      // this.isReported = true;
      const reportData = {
        interpretationId: this.id,
        reason: this.reportHandleReason,
      };
      reportInterpretation("post", reportData)
        .then((res) => {
          this.$Message.success("已举报，等待管理员审核……");
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    },

    onLike: function () {
      this.isLike = !this.isLike;
      if (this.isLike) {
        this.likeNumber += 1;
      } else {
        this.likeNumber -= 1;
      }
      likeInterpretation("get", this.$props.id)
        .then((res) => {
          const info = this.isLike ? "成功点赞" : "成功取消点赞";
          this.$Message.info(info);
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    },

    onCollect: function () {
      this.isCollect = !this.isCollect;
      if (this.isCollect) {
        this.favorNumber += 1;
      } else {
        this.favorNumber -= 1;
      }
      collectInterpretation("get", this.$props.id)
        .then((res) => {
          const info = this.isCollect ? "成功收藏" : "成功取消收藏";
          this.$Message.info(info);
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    },

    onComment: async function () {
      // await this.getComments();
      this.showComment = !this.showComment;
    },

    convertComments: function (comments) {
      comments = comments.map((x) => ({
        commentId: x.id,
        name: x.username,
        time: getLocalTime(x.created_at),
        id: x.user_id,
        comment: x.text,
        to: x.to_user ? x.to_user.username : 0,
        toId: x.to_user ? x.to_user.id : "",
        inputShow: false,
        headImg: '',
        parent_comment_id: x.parent_comment_id,
        reply: [],
      }));
      let father_comments_map = {};
      comments
        .filter((x) => x.parent_comment_id === undefined)
        .forEach((x) => {
          father_comments_map[x.commentId] = x;
        });
      comments.forEach((x) => {
        if (x.parent_comment_id !== undefined) {
          father_comments_map[x.parent_comment_id].reply.push(x);
        }
      });
      return Object.values(father_comments_map);
    },

    getComments: async function () {
      let username = "";
      let userid = "";
      let header = {};
      await getUserInfo()
        .then((res) => {
          userid = res.data.id;
          username = res.data.username;
          header = {
            myName: username,
            micro_knowledge_id: this.id,
            myHeader: this.$store.state.user.icon,
            myId: userid,
          };
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });

      await getMicroknowledgeComments("get", {
        micro_knowledge_id: this.id,
        pindex: 1,
        psize: 20,
      })
        .then((res) => {
          this.comments = {
            ...header,
            comments_init: this.convertComments(res.data.comment_list),
          };
          let comment;
          for (comment in this.comments.comments_init) {
            this.totalCommentNum++;
            this.totalCommentNum += this.comments.comments_init[
              comment
            ].reply.length;
          }
        })
        .catch((err) => {
          console.log(err);
          this.comments = header;
        });
    },

    showUser: function () {
      getUserInfo(this.$props.creator.id)
        .then((res) => {
          this.showUserControl = true;
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

    jumpUserInfo: function (id) {
      this.$router.push({
        name: "user_info",
        params: {
          id: id,
        },
      });
    },

    getTime: function (time) {
      return getLocalTime(time);
    },

    handleJumpInterpretation: function () {
      this.$router.push({
        name: "interpretation",
        params: {
          id: this.id,
        },
      });
    },
  },
};
</script>

<style>
.user-name {
  font-size: 26px;
  color: #4d4d4d;
}
.data-title {
  font-size: 18px;
  font-weight: bold;
}
</style>
