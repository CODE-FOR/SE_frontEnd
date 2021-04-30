<template>
  <div>
    <i-col span="16" offset="4">
      <Card>
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
        <Row v-else>
          <InterpretationCard
            :key="id"
            :content="content"
            :title="title"
            :tags="tags"
            :created_by="createdBy"
            :created_at="createdAt"
            :isInDetail="1"
          />
          <!-- <h1 align="center">{{ paperCitation }}</h1>
          <Divider />
          标签：<Tag
            v-for="(item, index) in topic"
            :key="index"
            class="sysTopics"
            >{{ item }}</Tag
          >
          <Divider />
          <div>
            <div align="left" style="float: left">解读发布者：{{ author }}</div>
            <div align="right">发布时间：{{ createTime }}</div>
          </div>
          <Divider /> -->
          <!-- {{ content }} -->
        </Row>
      </Card>
    </i-col>
  </div>
</template>

<script>
// TODO: URL confirmation!!!
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
import { getTags, recommend, getInterpretation } from "@/api/microknowledge";
import InterpretationCard from "@/view/micro-knowledge/interpretation-card";

export default {

  components: {InterpretationCard},

  data() {
    return {
      id: this.$route.params.id,
      title: "",
      abstract: "",
      tags: [],
      content: "",
      paperCitation: "",
      paperId: 0,
      createdBy: {},
      createdAt: "",
      loading: true,
    };
  },

  mounted() {
    this.loadData();
  },

  methods: {
    loadData() {
      getInterpretation(this.id)
        .then((res) => {
          console.log(res);
          this.tags = res.data.tags;
          this.content = res.data.content;
          this.paperCitation = res.data.paper.title;
          this.paperId = res.data.paper.id;
          this.createdBy = res.data.created_by;
          this.createdAt = res.data.created_at;
          this.title = res.data.title;
          console.log('fuck')
          console.log(this.createdAt)
          console.log(this.createdBy)
        })
        .catch((error) => {
          console.log(error);
        });
      this.loading = false;
      // console.log(this.title);
    },
  },
};
</script>
