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
          <h1 align="center">{{ paperCitation }}</h1>
          <Divider />
          标签：<Tag v-for="item in topic" :key="index" class="sysTopics">{{
          item
          }}</Tag>
          <Divider />
          <div>
            <div align="left" style="float:left">
              解读发布者：{{ author }}
            </div>
            <div align="right">发布时间：{{ createTime }}</div>
          </div>
          <Divider />
          {{ content }}
        </Row>
      </Card>
    </i-col>
  </div>
</template>

<script>
  // TODO: URL confirmation!!!
  // import { getTags, recommend, getInterpretation } from "@/api/interpretation";

  export default {
    data () {
      return {
        id: this.$route.params.id,
        title: 'default title',
        abstract: 'default abstract',
        topic: ['default_topic1', 'default_topic2'],
        content: 'default interpretation!',
        paperCitation: 'default paper title',
        paperId: 'default_paper_id',
        author: 'default author',
        createTime: '0000-00-00',
        loading: true
      }
    },

    mounted () {
      this.loadData()
    },

    methods: {

      loadData () {
        // alert("?");
        /*
          getInterpretation(this.id, "get")
            .then((res) => {
              this.topic = res.data.topic;
              this.content = res.data.content;
              this.paperCitation = res.data.paperCitation;
              this.paperId = res.data.paperId1;

            })
            .catch((error) => {
              console.log(error);
            });
          */
        this.loading = false;
        console.log(this.title)
      }
    }
  }
</script>
