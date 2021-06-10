<template>
  <div>
    <template v-if="isInDetail === 0 && isInPublishInterpretaion === false">
      <div class="ivu-card-head">
        <h2 v-if="title.length > 0"><div v-html="title"/></h2>
        <h2 v-else style="color:grey">标题内容不合法</h2>
      </div>
    </template>
    <template v-esle></template>
    <card :bordered="false" dis-hover :style="citeStyle">
      <div slot="title" align="left">
        发布者:
        <a @click.prevent="showUser" :id="id">{{
          creator["username"] === "" ? "未知用户" : creator["username"]
        }}</a>
        <!-- 发布者信息框 -->
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
              />
            </i-col>
            <i-col span="10">
              <div class="user-name">
                {{ userInfo.username }}
              </div>
              <p style="margin-top: 5px">
                邮箱: {{ userInfo.email || "暂无邮箱信息" }}
              </p>
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

      <p slot="extra">论文发布于: {{ createAt }}</p>
      <div align="left" v-html="content" style="word-break: break-all;"></div>
      <!-- <Row>{{ content }}</Row> -->
      <br />
      <div align="left">
        论文链接: <a :href="source"> {{ source }} </a> ( {{ publishedYear }} )
      </div>
      <br />
      <div align="left">
        <Tag v-for="(tag, index) in tags" :key="index" class="sysTopics">{{
          tag.name
        }}</Tag>
      </div>
      <br />
      <div align="left">作者:</div>
      <br />
      <div align="left">
        <Tag
          v-for="(au, indexForAuthor) in author"
          :key="indexForAuthor"
          class="sysTopics"
          >{{ au.toString() }}</Tag
        >
      </div>
      <br />
      <!-- <template v-if="displayType === 0"> -->
      <Row>
        <i-col span="12">
          <template v-if="isReport === 0">
            <ButtonGroup>
              <template v-if="isInPublishInterpretaion === false">
                <i-button @click="onLike" style="font-size: 14px">
                  <Icon type="md-thumbs-up" :color="likeColor" />
                  点赞 {{ likeNumber }}
                </i-button>
                <i-button @click="onCollect" style="font-size: 14px">
                  <Icon :type="collectType" :color="collectColor" />
                  收藏 {{ favorNumber }}
                </i-button>
                <template v-if="isInDetail === 0">
                  <i-button @click="handleJumpPaper" style="font-size: 14px">
                    <Icon type="ios-more" />
                    查看详细内容
                  </i-button>
                </template>
                <template v-else>
                  <i-button @click="setReport" style="font-size: 14px">
                    举报
                  </i-button>
                  <i-button
                    @click="writeInterpretation"
                    style="font-size: 14px"
                  >
                    <Icon type="ios-paper-plane" />
                    写解读
                  </i-button>
                </template>
              </template>
              <template v-else />
            </ButtonGroup>
            <br />
            <br />
            <template v-if="this.showReportReason === true">
              举报理由：{{ this.reportReason }}
            </template>
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
          <template v-if="isReport === 1">
            <template v-if="this.showReportReason === true">
              <Row>举报理由：{{ this.reportReason }}</Row>
              <br />
            </template>
            <ButtonGroup>
              <i-button @click="deletePaper" style="font-size: 14px">
                删除
              </i-button>
              <i-button @click="cancelReport" style="font-size: 14px">
                撤销举报
              </i-button>
            </ButtonGroup>
            <br />
            <br />
            <Form
              ref="reportHandle"
              :model="reportHandle"
              :rules="ruleCustom"
              :label-width="60"
            >
              <Form-item label="说明：" prop="explanation"
                ><Input
                  type="text"
                  v-model="reportHandle.explanation"
                  placeholder="请输入"
              /></Form-item>
            </Form>
          </template>
        </i-col>
      </Row>
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
} from "@/api/microknowledge.js";
import { follow, unfollow, getUserInfo } from "@/api/user";
import { getErrModalOptions, getLocalTime } from "@/libs/util";
import {
  likePaper,
  collectPaper,
  reportPaper,
  deletePaper,
  likeInterpretaion,
  collectInterpretation,
} from "@/api/microknowledge";

export default {
  name: "KnowledgeCard",
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

    explanation: {
      type: String,
      default: "",
    },

    isReport: {
      type: Number,
      default: 0,
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

    tags: {
      type: Array,
      default: () => {
        return [];
      },
    },

    isInPublishInterpretaion: {
      type: Boolean,
      default: false,
    },

    // 点赞
    isLike: {
      type: Boolean,
      default: false,
    },

    // 收藏
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

    source: {
      type: String,
      default: "",
    },

    publishedYear: {
      type: Number,
      default: 0,
    },

    title: {
      type: String,
      default: "",
    },

    author: {
      type: Array,
      default: () => [["Kimmy Granger"]],
    },
  },

  data() {
    const validateExp = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入（不可为空）"));
      } else {
        callback();
      }
    };

    return {
      showUserControl: false,
      userInfo: {},
      followText: "",
      detailController: false,
      reportHandleReason: "",
      reportHandle: {
        explanation: "",
      },
      ruleCustom: {
        explanation: [
          {
            required: true,
            validator: validateExp,
            trigger: "blur",
          },
        ],
      }
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

    citeMessage: function () {
      return this.cited ? "取消" : this.citeMessageInit;
    },

    popId: function () {
      return "pop" + this.id;
    },
  },

  methods: {
    // TODO: need to be finished!!! -> administrator delete
    deletePaper: function () {
      if (confirm("确定要删除该论文吗？")) {
        const data = {
          paperId: this.id,
          reason: this.reportHandle.explanation
        };
        deletePaper("post", data)
          .then((res) => {
            this.$Message.success("已删除该论文")
          })
          .catch((error) => {
            this.$Modal.error(getErrModalOptions(error));
          });
      }
    },

    setReport: function () {
      this.isReported = !this.isReported;
    },

    // TODO: need to be finished!!! -> administrator delete
    cancelReport: function () {},

    writeInterpretation: function () {
      this.$store.commit("getPaperId", this.id);
      this.$router.push({
        name: "publish_interpretation",
        params: {
          id: this.id,
        },
      });
    },

    onLike: function () {
      this.isLike = !this.isLike;
      if (this.isLike) {
        this.likeNumber += 1;
      } else {
        this.likeNumber -= 1;
      }
      likePaper("get", this.id)
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
      collectPaper("get", this.id)
        .then((res) => {
          const info = this.isCollect ? "成功收藏" : "成功取消收藏";
          this.$Message.info(info);
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    },

    onReport: function () {
      // this.isReported = true;
      const reportData = {
        paperId: this.id,
        reason: this.reportHandleReason,
      };
      reportPaper("post", reportData)
        .then((res) => {
          this.$Message.success("已举报，等待管理员审核……");
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    },

    showUser: function () {
      getUserInfo(this.creator.id)
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

    handleJumpPaper: function () {
      this.$router.push({
        name: "paper",
        params: {
          id: this.id,
          administrator: this.isAdmin,
          showReportReason: this.showReportReason,
          reportReason: this.reportReason
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
