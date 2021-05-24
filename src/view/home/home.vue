<template>
  <Row>
    <i-col offset="4" span="15">
      <Card>
        <Tabs v-model="activeTab" @on-click="changeTab">
          <TabPane label="推荐" name="recommend">
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
            <template v-if="items.length !== 0">
              <template v-for="item in pageComponent.items">
                <template v-if="item.type === 0">
                  <KnowledgeCard :key="item.id" v-bind="item" />
                </template>
                <template v-else>
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
        </Tabs>
        <Page
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
      // activeTab: "favorite",
      activeTab: "recommend",
      knowledgeType: "micro-evidence", // TODO: 这个应该用 vuex 记住用户的上一次选择
      selectTagList: [],
      tagSearch: "",
      tagList: [],
      pageIndex: 1,
      hasNextPage: true,
      items: [
        {
          type: 0,
          id: 1,
          creator: {
            username: "lzw_super",
            id: 3,
          },
          createAt: "2021-4-29 20:30:01",
          content: "content",
          tags: [{ name: "test", id: 1 }],
          isLike: false,
          isCollect: false,
          likeNumber: 0,
          favorNumber: 0,
          source: "http://www.google.com",
          author: ["吕云帆"],
          title: "abcde",
        },
        {
          type: 1,
          id: 1,
          tags: [{ name: "test", id: 1 }],
          isLike: false,
          isCollect: false,
          likeNumber: 0,
          favorNumber: 0,
          title: "fghij",
          content: "content",
          creator: {
            username: "lzw_super",
            id: 3,
          },
          createAt: "2021-4-29 20:30:00",
        },
      ],
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
    changeIndexPage: function (i) {
      this.$store.commit("setHomePage", i);
      this.pageComponent.items = [];
      setTimeout(() => {
        document
          .getElementsByClassName("content-wrapper ivu-layout-content")[0]
          .scroll(0, 0);
      }, 400);
      this.pageComponent.pageIndex = i;
      this.loadData();
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
              title: item.title,
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
      console.log(this.pageComponent.items);
    },

    // TODO:
    loadFavor: function () {
      this.loading = true;
      recentFavor({
        pindx: this.pageComponent.pageIndex,
      }).then((res) => {
        this.pageComponent.pageNum = res.data.page_num;
        const mapData = res.data.recent.map((item) => {
          if (item.type === 0) {
            return {
              type: item.type,
              id: item.id,
              creator: item.created_by,
              createAt: getLocalTime(item.created_at),
              content: item.abstract,
              tags: item.tags,
              isLike: item.is_like,
              isCollect: item.is_collect,
              totalLike: item.like_num,
              totalCollect: item.collect_num,
              source: item.source,
              author: item.author,
              title: item.title,
            };
          } else {
            return {
              type: item.type,
              id: item.id,
              creator: item.created_by,
              createAt: getLocalTime(item.created_at),
              tags: item.tags,
              isLike: item.is_like,
              isCollect: item.is_collect,
              totalLike: item.like_num,
              totalCollect: item.collect_num,
              content: item.content,
            };
          }
        });
        this.pageComponent.items.push(...mapData);
        this.loading = false;
      });
    },

    changeTab: function (name) {
      this.activeTab = name;
      this.pageComponent.pageIndex = 1;
      this.$store.commit("setHomePage", 1);
      this.pageComponent.items = [];
      if (this.activeTab === "favorite") {
        this.loadFavor();
      } else {
        this.loadData();
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
