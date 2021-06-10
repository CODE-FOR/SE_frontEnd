<template>
  <div>
    <h1 align="center">
      {{ title }}
    </h1>
    <i-col offset="2" span="20">
      <Card>
        <Tabs value="paperAbstract" :animated="false">
          <TabPane label="论文详情" name="paperAbstract">
            <KnowledgeCard
              :key="id"
              :id="id"
              :content="content"
              :creator="creator"
              :createAt="createAt"
              :tags="tags"
              :source="source"
              :publishedYear="publishedYear"
              :author="author"
              :isInDetail="1"
              :isLike="isLike"
              :likeNumber="likeNumber"
              :isCollect="isCollect"
              :favorNumber="favorNumber"
              :isReport="administrator"
              :showReportReason="showReportReason"
              :reportReason="reportReason"
            />
          </TabPane>
          <TabPane label="论文解读列表" name="interpretationList">
            <template v-if="items.length !== 0">
              <InterpretationCard
                v-for="item in pageComponent.items"
                :key="item.id"
                :isReported="false"
                v-bind="item"
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
  import { getTags, recommend, microKnowledgeIdReq } from "@/api/microknowledge";
  import { getPaperInterpreations } from "@/api/microknowledge";
  import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
  export default {
    components: { InterpretationCard, KnowledgeCard },
    data() {
      return {
        id: parseInt(this.$route.params.id),
        administrator: parseInt(this.$route.params.administrator),
        showReportReason: this.$route.params.showReportReason,
        reportReason: this.$route.params.reportReason,
        title: "title",
        content: "abstract",
        creator: {},
        createAt: "2000/01/01",
        tags: [],
        source: "source",
        publishedYear: 2000,
        author: ["Kimmy Granger"],
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
      if (this.administrator !== 0 && this.administrator !== 1) {
        this.administrator = 0;
      }
      if (sessionStorage.getItem("administrator")) {
        this.administrator = parseInt(sessionStorage.getItem("administrator"))
      }
      sessionStorage.setItem(
        "administrator",
        this.administrator
      );
      this.pageComponent.pageIndex = this.$store.state.paperInfo.page;
      this.loadData();
    },

    destroyed() {
      sessionStorage.removeItem('administrator');
    },

    methods: {
      loadData: function () {
        this.loading = true;
        microKnowledgeIdReq(this.id, 0, "get")
          .then((res) => {
            this.title = res.data.title.replace(/<[^>]+>/g, "");
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
            const mapData = res.data.interpretations.map((item) => {
              return {
                id: item.id,
                content: item.content.replace(/<[^>]+>/g, "").length > 100
                  ? item.content.replace(/<[^>]+>/g, "").substring(0, 100) + "..."
                  : item.content.replace(/<[^>]+>/g, ""),
                title: item.title.replace(/<[^>]+>/g, ""),
                tags: item.tags,
                creator: item.created_by,
                createAt: getLocalTime(item.created_at),
                isLike: item.is_like,
                isCollect: item.is_collect,
                likeNumber: item.like_num,
                favorNumber: item.collect_num,
              }
            })
            this.items = []
            this.items.push(...mapData)
            this.pageComponent.items = this.items.slice(
              (this.pageComponent.pageIndex - 1) * this.pageComponent.pageSize,
              Math.min(
                this.pageComponent.pageIndex * this.pageComponent.pageSize,
                this.items.length
              )
            );
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
