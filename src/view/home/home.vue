<template>
  <Row class="root">
    <i-col offset="4" span="15">
      <Card>
        <Tabs v-model="activeTab" @on-click="changeTab" :animated="false">
          <TabPane label="论文列表" name="recommend">
            <template v-if="pageComponent.items.length !== 0">
              <KnowledgeCard
                v-for="item in pageComponent.items"
                :key="item.id"
                :isReport="0"
                :isAdmin="0"
                v-bind="item"
              />
            </template>
            <Row v-if="loading">
              <i-col class="demo-spin-col" offset="8" span="8">
                <Spin fix>
                  <Icon
                    type="ios-loading"
                    size="18"
                    class="demo-spin-icon-load"
                  ></Icon>
                  <div>Loading</div>
                </Spin>
              </i-col>
            </Row>
          </TabPane>
          <TabPane label="关注" name="favorite">
            <template v-if="pageComponent.items.length !== 0">
              <template v-for="item in pageComponent.items">
                <template
                  v-if="item.type === 0 && knowledgeType != 'interpretation'"
                >
                  <KnowledgeCard :key="item.id" v-bind="item" />
                </template>
                <template
                  v-else-if="item.type === 1 && knowledgeType != 'paper'"
                >
                  <InterpretationCard :key="item.id" v-bind="item" />
                </template>
              </template>
              <Row v-if="loading">
                <i-col class="demo-spin-col" offset="8" span="8">
                  <Spin fix>
                    <Icon
                      type="ios-loading"
                      size="18"
                      class="demo-spin-icon-load"
                    ></Icon>
                    <div>Loading</div>
                  </Spin>
                </i-col>
              </Row>
            </template>
          </TabPane>
          <TabPane label="智能推荐" name="realRec">
            <template v-if="pageComponent.items.length !== 0">
              <InterpretationCard
                v-for="item in pageComponent.items"
                :key="item.id"
                :isReport="0"
                :isAdmin="0"
                v-bind="item"
              />
            </template>
            <Row v-if="loading">
              <i-col class="demo-spin-col" offset="8" span="8">
                <Spin fix>
                  <Icon
                    type="ios-loading"
                    size="18"
                    class="demo-spin-icon-load"
                  ></Icon>
                  <div>Loading</div>
                </Spin>
              </i-col>
            </Row>
          </TabPane>
        </Tabs>
        <Page
          v-if="activeTab != 'realRec'"
          :total="pageComponent.pageNum * 5"
          :current="pageComponent.pageIndex"
          :page-size="pageComponent.pageSize"
          prev-text="上一页"
          next-text="下一页"
          show-elevator
          @on-change="changeIndexPage"
        ></Page>
      </Card>
    </i-col>
    <template v-if="activeTab != 'recommend'">
      <i-col offset="1" span="4">
        <Card>
          <p slot="title" style="font-size: 18px">筛选器</p>
          <p class="type-selector">论文/论文解读：</p>
          <i-select
            v-model="knowledgeType"
            @on-change="selectType"
            style="width: 80%"
          >
            <Option value="paper"> 论文 </Option>
            <Option value="interpretation"> 论文解读 </Option>
            <Option value="all"> 全部 </Option>
          </i-select>
        </Card>
      </i-col>
    </template>
  </Row>
</template>

<script>
import KnowledgeCard from "@/view/micro-knowledge/knowledge-card";
import InterpretationCard from "@/view/micro-knowledge/interpretation-card";
import { recentKnowledge } from "@/api/user";
import { recentFavor } from "@/api/user";
import { getTags, recommend, microKnowledgeIdReq } from "@/api/microknowledge";
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
import { getPaperList } from "@/api/microknowledge";
export default {
  name: "home",

  components: { KnowledgeCard, InterpretationCard },

  data() {
    return {
      knowledgeType: "all",
      activeTab: "recommend",
      knowledgeType: "micro-evidence", // TODO: 这个应该用 vuex 记住用户的上一次选择
      selectTagList: [],
      tagSearch: "",
      tagList: [],
      pageIndex: 1,
      hasNextPage: true,
      items: [],
      loading: true,
      pageComponent: {
        pageSize: 5,
        pageIndex: 1,
        items: [],
        pageNum: 0,
      },
    };
  },

  mounted() {
    getTags("get", {
      pindx: 1,
      num_per_page: 99,
      presupposed: true,
    })
      .then((res) => {
        this.tagList = res.data.page.map((tag) => ({
          value: tag.name,
          label: tag.name,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
    this.pageComponent.pageIndex = this.$store.state.home.page;
    this.loadData();
  },

  methods: {
    selectType: function () {
      console.log(this.knowledgeType);
    },

    changeIndexPage: function (i) {
      this.$store.commit("setHomePage", i);
      this.pageComponent.items = [];
      setTimeout(() => {
        document
          .getElementsByClassName("content-wrapper ivu-layout-content")[0]
          .scroll(0, 0);
      }, 400);
      this.pageComponent.pageIndex = i;
      if (this.activeTab === "favorite") {
        this.loadFavor();
      } else if (this.activeTab === "recommend") {
        this.loadData();
      }
    },

    loadRecommend: function () {
      this.loading = true;
      recommend().then((res) => {
        this.pageComponent.items = res.data.recommend.map((item) => {
          return {
            title: item.title.replace(/<[^>]+>/g, ""),
            id: item.id,
            creator: item.created_by,
            createAt: getLocalTime(item.created_at),
            tags: item.tags,
            isLike: item.is_like,
            isCollect: item.is_collect,
            likeNumber: item.like_num,
            favorNumber: item.collect_num,
            content:
                item.content.replace(/<[^>]+>/g, "").length > 100
                  ? item.content.replace(/<[^>]+>/g, "").substring(0, 100) +
                    "..."
                  : item.content.replace(/<[^>]+>/g, ""),
          };
        });
        this.loading = false;
        console.log(JSON.stringify(this.pageComponent.items))
      });
    },

    loadData: function () {
      this.loading = true;
      getPaperList(this.pageComponent.pageIndex)
        .then((res) => {
          this.pageComponent.pageNum = res.data.page_num;
          this.hasNextPage = res.data.has_next;
          const mapData = res.data.papers.map((item) => {
            return {
              type: 0,
              id: item.id,
              creator: item.created_by,
              createAt: getLocalTime(item.created_at),
              publishedYear: item.published_year,
              content:
                item.abstract.replace(/<[^>]+>/g, "").length > 100
                  ? item.abstract.replace(/<[^>]+>/g, "").substring(0, 100) +
                    "..."
                  : item.abstract.replace(/<[^>]+>/g, ""),
              tags: item.tags,
              isLike: item.is_like,
              isCollect: item.is_collect,
              likeNumber: item.like_num,
              favorNumber: item.collect_num,
              source: item.source,
              author: item.author,
              title: item.title.replace(/<[^>]+>/g, ""),
            };
          });
          this.pageComponent.items.push(...mapData.filter((x) => x));
          this.loading = false;
        })
        .catch((error) => {
          console.log(error.response.status);
          if (error.response.status === 400) {
            this.hasNextPage = false;
          }
        });
    },

    loadFavor: function () {
      this.loading = true;
      recentFavor({
        pindx: this.pageComponent.pageIndex,
      }).then((res) => {
        this.pageComponent.pageNum = res.data.page_num;
        const mapData = res.data.recent.map((item) => {
          console.log(res);
          if (item.type === 0) {
            return {
              type: item.type,
              id: item.id,
              creator: item.created_by,
              createAt: getLocalTime(item.created_at),
              content:
                item.abstract.replace(/<[^>]+>/g, "").length > 100
                  ? item.abstract.replace(/<[^>]+>/g, "").substring(0, 100) +
                    "..."
                  : item.abstract.replace(/<[^>]+>/g, ""),
              tags: item.tags,
              isLike: item.is_like,
              isCollect: item.is_collect,
              likeNumber: item.like_num,
              favorNumber: item.collect_num,
              source: item.source,
              author: item.author,
              title: item.title.replace(/<[^>]+>/g, ""),
            };
          } else {
            return {
              title: item.title.replace(/<[^>]+>/g, ""),
              type: item.type,
              id: item.id,
              creator: item.created_by,
              createAt: getLocalTime(item.created_at),
              tags: item.tags,
              isLike: item.is_like,
              isCollect: item.is_collect,
              likeNumber: item.like_num,
              favorNumber: item.collect_num,
              content:
                item.content.replace(/<[^>]+>/g, "").length > 100
                  ? item.content.replace(/<[^>]+>/g, "").substring(0, 100) +
                    "..."
                  : item.content.replace(/<[^>]+>/g, ""),
            };
          }
        });
        this.pageComponent.items.push(...mapData);
        this.loading = false;
      });
    },

    changeTab: function (name) {
      // name in ["recommend", "favorite"]
      this.activeTab = name;
      this.pageComponent.pageIndex = 1;
      this.$store.commit("setHomePage", 1);
      this.pageComponent.items = [];
      if (this.activeTab === "favorite") {
        this.loadFavor();
      } else if (this.activeTab === "recomment") {
        this.loadData();
      } else {
        this.loadRecommend();
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
.root {
  min-width: 1300px;
}
</style>
