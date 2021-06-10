<template>
  <Row>
    <i-col offset="4" span="15">
      <Card>
        <Tabs value="paperReport" :animated="false">
          <TabPane label="举报论文列表" name="paperReport">
            <template v-if="pageReport.items.length !== 0">
              <KnowledgeCard
                v-for="item in pageReport.items"
                :key="item.id"
                v-bind="item"
                :isInDetial="0"
                :isAdmin="1"
                :isReport="0"
                :showReportReason="true"
              />
            </template>
            <Row v-if="reportLoading">
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
            <Page
              :total="pageReport.pageNum * 5"
              :current="pageReport.pageIndex"
              :page-size="pageReport.pageSize"
              prev-text="上一页"
              next-text="下一页"
              show-elevator
              @on-change="changeReportPage"
            ></Page>
          </TabPane>
        </Tabs>
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
  import { getPaperList, getReportPaperList } from "@/api/microknowledge";
  export default {
    name: "admin-paperlist",

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
        reportLoading: true,
        // all papers
        pageComponent: {
          pageSize: 5,
          pageIndex: 1,
          items: [],
          pageNum: 0,
        },
        // papers reported
        pageReport: {
          pageSize: 5,
          pageIndex: 1,
          items: [],
          pageNum: 0,
        }
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
      this.loadReportData();
    },

    methods: {
      changeReportPage: function (i) {
        this.pageReport.items = [];
        setTimeout(() => {
          document
            .getElementsByClassName("content-wrapper ivu-layout-content")[0]
            .scroll(0, 0);
        }, 400);
        this.pageReport.pageIndex = i;
        this.loadReportData();
      },

      loadReportData: function() {
        this.reportLoading = true;
        getReportPaperList(this.pageReport.pageIndex, "get")
          .then((res) => {
            this.pageReport.pageNum = res.data.page_num;
            this.hasNextPage = res.data.has_next;
            const mapData = res.data.reports.map((item) => {
              return {
                type: 0,
                id: item.paper.id,
                creator: item.paper.created_by,
                createAt: getLocalTime(item.paper.created_at),
                reporter: item.created_by,
                reportAt: getLocalTime(item.created_at),
                reportReason: item.reason,
                publishedYear: item.paper.published_year,
                content:
                  item.paper.abstract.replace(/<[^>]+>/g, "").length > 100
                    ? item.paper.abstract.replace(/<[^>]+>/g, "").substring(0, 100) +
                    "..."
                    : item.paper.abstract.replace(/<[^>]+>/g, ""),
                tags: item.tags,
                isLike: item.paper.is_like,
                isCollect: item.paper.is_collect,
                likeNumber: item.paper.like_num,
                favorNumber: item.paper.collect_num,
                source: item.paper.source,
                author: item.paper.author,
                title: item.paper.title.replace(/<[^>]+>/g, "")
              };
            });
            this.pageReport.items.push(...mapData.filter((x) => x));
            this.reportLoading = false;
          })
          .catch((error) => {
            console.log(error.response.status);
            if (error.response.status === 400) {
              this.hasNextPage = false;
            }
          });
        console.log(this.pageReport.items);
      },
    }
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
