<template>
  <div>
    <i-col span="16" offset="4">
      <i-col offset="2" span="20">
        <Card>
          <Tabs value="paperAbstract">
            <TabPane label="论文解读详情" name="paperAbstract">
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
                  :id="id"
                  :content="content"
                  :title="title"
                  :tags="tags"
                  :created_by="creator"
                  :created_at="createdAt"
                  :isInDetail="1"
                />
              </Row>
            </TabPane>
          </Tabs>
        </Card>
      </i-col>
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
      // paperCitation: "",
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
      alert(this.id);
      getInterpretation(this.id)
        .then((res) => {
          console.log(res);
          // this.tags = res.data.tags;
          this.tags = [{ id: 1, name: "test", type: 0 }];
          this.content = res.data.content;
          // this.paperCitation = res.data.paper.title;
          this.paperId = parseInt(res.data.paper.id);
          this.creator = res.data.created_by;
          this.createdAt = getLocalTime(res.data.created_at);
          this.title = res.data.title;
          console.log("fuck");
          console.log(this.content);
          console.log(this.createdAt);
          console.log(this.creator);
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
