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
            <Row v-else-if="hasNextPage">
              <i-col style="text-align: center">
                <a @click.prevent="loadMoreData"> 加载更多 </a>
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
      interpretations: [],
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
        })
        .catch((error) => {
          console.log(error);
        });
    },

    changeIndexPage: function (i) {
      this.pageComponent.pageIndex = i;
      this.pageComponent.items = this.items.slice(
        (i - 1) * this.pageComponent.pageSize,
        i * this.pageComponent.pageSize
      );
    },

    loadMoreData: function () {
      (this.pageIndex = this.pageIndex + 1), this.loadInterpretation();
    },

    // TODO: need backend api: use paper id to find all the interpretations about this paper
    // res: {
    //   interpretations: [] => {
    //     id
    //     content
    //   }
    // }

    // loadInterpretation() {
    //   getPaperInterpreations({
    //     paper_id: id
    //   }).then(res => {
    //     const mapData = res.datas.interpretations.map(item => {
    //       if (this.idList.includes(item.id)) {
    //         return false
    //       } else {
    //         this.idList.push(item.id)
    //       }
    //       return {
    //         id: item.id,
    //         content: item.content
    //       }
    //     })
    //     this.interpretations.push(...mapData.filter(x => x))
    //   })
    // }
    loadInterpretation: function () {
      this.loading = true;
      const mapData = {
        id: 1,
        creator: {
          id: 1,
          username: "lzw_user",
        },
        kind: 1,
        createAt: getLocalTime("August 19, 1975 23:15:30 GMT+00:00"),
        publishedYear: 2021,
        content: "<p>test</p>",
        tags: ["a", "b", "c", "d"],
        isLike: 0,
        isCollect: 0,
        likeNumber: 0,
        favorNumber: 0,
        displayType: 0,
        source: "http://www.baidu.com",
        citation: "http://www.baidu.com",
        evidences: [],
      };
      this.items.push(mapData);
      this.pageIndex.items = this.items.slice(
        (this.pageComponent.pageIndex - 1) * this.pageComponent.pageSize,
        Math.min(this.pageComponent.pageIndex * this.pageComponent.pageSize, this.items.length)
      );
      this.loading = false;
      // console.log(items);
    },
  },
};
</script>
