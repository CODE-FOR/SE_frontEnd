<template>
  <div>
    <i-col offset="4" span="15">
      <Card>
        <Tabs value="InterpretationReport" animated="false">
          <TabPane label="举报论文解读列表" name="InterpretationReport">
            <template v-if="pageComponent.items.length !== 0">
              <InterpretationCard
                v-for="item in pageComponent.items"
                :key="item.id"
                v-bind="item"
                :isAdmin="1"
                :isReport="0"
                :isInDetail="0"
                :showReportReason="true"
                :reportReason="item.reportReason"
              />
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
              <Page
                :total="items.length"
                :current="pageComponent.pageIndex"
                :page-size="pageComponent.pageSize"
                prev-text="上一页"
                next-text="下一页"
                show-elevator
                @on-change="changeIndexPage"
              ></Page>
            </template>
            <template v-else>
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
            </template>
          </TabPane>
        </Tabs>
      </Card>
    </i-col>
  </div>
</template>


<script>
  import InterpretationCard from "@/view/micro-knowledge/interpretation-card";
  import KnowledgeCard from "@/view/micro-knowledge/knowledge-card";
  import { getTags, recommend, microKnowledgeIdReq, getReportInterpretationList } from "@/api/microknowledge";
  import { getPaperInterpreations } from "@/api/microknowledge";
  import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
  export default {
    components: { InterpretationCard, KnowledgeCard },
    data() {
      return {
        // id: parseInt(this.$route.params.id),
        id: 20,
        title: "title",
        content: "abstract",
        creator: {},
        createAt: "2000/01/01",
        tags: [],
        source: "source",
        publishedYear: 2000,
        author: "author",
        items: [],
        loading: true,
        likeNumber: 0,
        favorNumber: 0,
        isLike: false,
        isCollect: false,
        pageComponent: {
          pageIndex: 1,
          pageSize: 5,
          items: [],
        },
      };
    },

    mounted() {
      this.pageComponent.pageIndex = this.$store.state.paperInfo.page;
      this.loadReportData();
    },

    methods: {
      loadReportData: function () {
        this.loading = true;
        getReportInterpretationList(this.pageComponent.pageIndex, "get")
          .then((res) => {
            /*
            this.title = res.data.title;
            this.content = res.data.abstract;
            this.creator = res.data.created_by;
            this.createAt = getLocalTime(res.data.created_at);
            this.publishedYear = res.data.publishedYear;
            this.tags = res.data.tags;
            this.author = res.data.author;
            this.source = res.data.source;
            this.isLike = res.data.is_like;
            this.isCollect = res.data.is_collect;
            this.favorNumber = res.data.collect_num;
            this.likeNumber = res.data.like_num;
            */
            this.pageComponent.pageNum = res.data.page_num;
            //this.hasNextPage = res.data.has_next;
            const mapData = res.data.reports.map((item) => {
              return {
                reporter: item.created_by,
                reportAt: item.created_at,
                reportReason: item.reason,
                id: item.interpretation.id,
                content: item.interpretation.content.replace(/<[^>]+>/g, "").length > 100
                  ? item.interpretation.content.replace(/<[^>]+>/g, "").substring(0, 100) + "..."
                  : item.interpretation.content.replace(/<[^>]+>/g, ""),
                title: item.interpretation.title.replace(/<[^>]+>/g, ""),
                tags: item.interpretation.tags,
                creator: item.interpretation.created_by,
                createAt: getLocalTime(item.interpretation.created_at),
                isLike: item.interpretation.is_like,
                isCollect: item.interpretation.is_collect,
                likeNumber: item.interpretation.like_num,
                favorNumber: item.interpretation.collect_num,
              }
            });
            this.items = [];
            this.items.push(...mapData);
            this.pageComponent.items = this.items.slice(
              (this.pageComponent.pageIndex - 1) * this.pageComponent.pageSize,
              Math.min(
                this.pageComponent.pageIndex * this.pageComponent.pageSize,
                this.items.length
              )
            );
            console.log(this.items);
            this.loading = false;
          })
          .catch((error) => {
            console.log(error);
          });
      },

      changeIndexPage: function (i) {
        this.$store.commit("setPaperInfoPage", i);
        setTimeout(() => {
          document
            .getElementsByClassName("content-wrapper ivu-layout-content")[0]
            .scroll(0, 0);
        }, 400);
        this.pageComponent.pageIndex = i;
        this.pageComponent.items = this.items.slice(
          (i - 1) * this.pageComponent.pageSize,
          Math.min(i * this.pageComponent.pageSize, this.items.length)
        );
      },
    },
  };
</script>
