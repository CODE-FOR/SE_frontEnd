<template>
  <div>
    <i-col offset="2" span="20">
      <Card>
        <Tabs value="paperAbstract">
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
                :created_by="creator"
                :created_at="createdAt"
                :isInDetail="1"
              />
            </template>
          </TabPane>
          <TabPane label="评论列表" name="commentList">
            // TODO: show comments
          </TabPane>
        </Tabs>
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
  components: { InterpretationCard },

  data() {
    return {
      id: parseInt(this.$route.params.id),
      title: "456",
      tags: [],
      content: "456",
      paperId: 0,
      creator: {},
      createdAt: "",
      loading: true,
    };
  },

  mounted() {
    this.loadData();
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
          this.createdAt = getLocalTime(res.data.created_at);
          this.title = res.data.title;
          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>
