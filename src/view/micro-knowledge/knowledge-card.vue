<template>
  <div>
    <template v-if="isInDetail === 0">
      <div class="ivu-card-head">
        <h2>{{ title }}</h2>
      </div>
    </template>
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
              <Avatar
                src="https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png"
                style="width: 100%; height: 100%"
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

      <p slot="extra">论文发布于: {{ createAt }}</p>
      <div align="left" v-html="content"></div>
      <!-- <Row>{{ content }}</Row> -->
      <br />
      <div align="left">
        论文链接: <a :href="source"> {{ source }} </a> ( {{ publishedYear }} )
      </div>
      <br />
      <Modal v-model="detailController" :footer-hide="true">
        <Divider />
        <Row v-for="item in evidences" :key="item.id">
          <i-col style="font-size: 18px">
            {{ item.content }}
          </i-col>
          <br />
          <i-col style="font-size: 14px">
            参考文献: <a :href="item.source"> {{ item.citation }} </a>
          </i-col>
          <i-col style="font-size: 14px">
            由
            <a @click.prevent="jumpUserInfo(item.created_by.id)">
              {{ item.created_by.username }}
            </a>
            发布于：{{ getTime(item.created_at) }}
          </i-col>
          <Divider />
        </Row>
      </Modal>
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
          <ButtonGroup>
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
          </ButtonGroup>
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
import {likePaper, collectPaper, likeInterpretaion, collectInterpretation} from '@/api/microknowledge'
export default {
  name: "KnowledgeCard",
  props: {
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

    isLike: {
      type: Boolean,
      default: false
    },

    isCollect: {
      type: Boolean,
      default: false
    },

    likeNumber: {
      type: Number,
      default: 0
    },

    favorNumber: {
      type: Number,
      default: 0
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
      default: () => {
        return [];
      },
    },
  },

  data() {
    return {
      showUserControl: false,
      userInfo: {},
      followText: "",
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
    onLike: function () {
      this.isLike = !this.isLike;
      if (this.isLike) {
        this.likeNumber += 1;
      } else {
        this.likeNumber -= 1;
      }
      likePaper("post", this.id)
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
      collectPaper(
        "get",
        this.id
      )
        .then((res) => {
          const info = this.isCollect ? "成功收藏" : "成功取消收藏";
          this.$Message.info(info);
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
