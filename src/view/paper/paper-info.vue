<template>
  <div>
    <h1 align="center">
      {{ title }}
    </h1>
    <i-col offset="4" span="16">
      <Tabs value="paperAbstract">
        <TabPane label="论文详情" name="paperAbstract">
          <span v-html="abstract" />
        </TabPane>
        <TabPane label="论文解读列表" name="interpretationList">
          <template v-if="items.length !== 0">
            <InterpretationCard
              v-for="item in pageComponent.items"
              :key="item.id"
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
        </TabPane>
      </Tabs>
    </i-col>
  </div>
</template>


<script>
import InterpretationCard from "@/view/micro-knowledge/interpretation-card";
import { getTags, recommend, microKnowledgeIdReq } from "@/api/microknowledge";
import { getPaperInterpreations } from "@/api/microknowledge";
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
export default {
  components: { InterpretationCard },
  data() {
    return {
      id: parseInt(this.$route.params.id),
      title: "title",
      abstract: "abstract",
      idList: [],
      items: [],
      hasNextPage: true,
      loading: true,
      pageIndex: 0,
      pageComponent: {
        pageIndex: 1,
        pageSize: 3,
        items: [],
      },
    };
  },

  mounted() {
    this.loadData();
    this.loadInterpretation();
  },

  methods: {
    loadData: function () {
      microKnowledgeIdReq(this.id, 0, "get")
        .then((res) => {
          this.title = res.data.title;
          this.abstract = res.data.abstract;
          // this.items = res.data.interpretations
        })
        .catch((error) => {
          console.log(error);
        });
        console.log(this.items)
    },

    changeIndexPage: function (i) {
      this.pageComponent.pageIndex = i;
      this.pageComponent.items = this.items.slice(
        (i - 1) * this.pageComponent.pageSize,
        Math.main(i * this.pageComponent.pageSize, this.items.length)
      );
    },
  },
};
</script>
