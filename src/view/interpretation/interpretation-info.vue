<template>
  <div>
    <i-col offset="2" span="20">
      <Card>
        <Tabs value="paperAbstract" :animated="false">
          <TabPane label="论文解读详情" name="paperAbstract">
            <template v-if="loading">
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
            <template v-else>
              <InterpretationCard
                :id="id"
                :content="content"
                :title="title"
                :tags="tags"
                :creator="creator"
                :createAt="createAt"
                :paperId="paperId"
                :isInDetail="1"
                :isLike="isLike"
                :isCollect="isCollect"
                :likeNumber="likeNumber"
                :favorNumber="favorNumber"
                :isReport="administrator"
                :showReportReason="showReportReason"
                :reportReason="reportReason"
              />
            </template>
          </TabPane>
        </Tabs>
      </Card>
    </i-col>
  </div>
</template>

<script>
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
import { getTags, recommend, getInterpretation } from "@/api/microknowledge";
import InterpretationCard from "@/view/micro-knowledge/interpretation-card";

export default {
  components: { InterpretationCard },

  data() {
    return {
      id: parseInt(this.$route.params.id),
      administrator: parseInt(this.$route.params.administrator),
      showReportReason: this.$route.params.showReportReason,
      reportReason: this.$route.params.reportReason,
      title: "456",
      tags: [],
      content: "456",
      paperId: 0,
      creator: {},
      createAt: "",
      loading: true,
      likeNumber: 0,
      isLike: false,
      isCollect: false,
      favorNumber: 0
    };
  },

  mounted() {
    if (this.administrator !== 0 && this.administrator !== 1) {
      this.administrator = 0;
    }
    if (sessionStorage.getItem("interpretation_administrator")) {
      this.administrator = parseInt(sessionStorage.getItem("interpretation_administrator"))
    }
    sessionStorage.setItem(
      "interpretation_administrator",
      this.administrator
    );
    //this.pageComponent.pageIndex = this.$store.state.interpretationInfo.page;
    //alert(1);
    this.loadData();
  },

  destroyed() {
    sessionStorage.removeItem('interpretation_administrator');
  },

  methods: {
    loadData() {
      this.loading = true;
      getInterpretation(this.id)
        .then((res) => {
          console.log(res);
          this.tags = res.data.tags;
          this.content = res.data.content;
          this.paperId = parseInt(res.data.paper.id);
          this.creator = res.data.created_by;
          this.createAt = getLocalTime(res.data.created_at);
          this.title = res.data.title.replace(/<[^>]+>/g, "");
          this.likeNumber = res.data.like_num;
          this.isLike = res.data.is_like;
          this.isCollect = res.data.is_collect;
          this.favorNumber = res.data.collect_num;
          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
