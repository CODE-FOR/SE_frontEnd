<template>
  <Row>
    <i-col offset="2" span="15">
      <Card>
        <template v-if="knowledgeType === 'paper'">
          <template v-if="items.length !== 0">
            <KnowledgeCard
              v-for="item in items"
              :key="item.key"
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
          </template>
          <div style="text-align: center; font-size: 20px" v-else>
            <br />
            <br />
            <br />
            暂无相关搜索结果
            <br />
            <br />
            <br />
          </div>
        </template>
        <template v-else>
          <template v-if="items.length !== 0">
            <InterpretationCard
              v-for="item in items"
              :key="item.key"
              v-bind="item"
            />
            <Row if="loading">
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
          </template>
          <div style="text-align: center; font-size: 20px" v-else>
            <br />
            <br />
            <br />
            暂无相关搜索结果
            <br />
            <br />
            <br />
          </div>
        </template>
        <Page
          :total="totalData"
          :current="pageIndex"
          :page-size="pageSize"
          prev-text="上一页"
          next-text="下一页"
          show-elevator
          @on-change="changeIndexPage"
        ></Page>
      </Card>
    </i-col>

    <i-col offset="1" span="6">
      <Card>
        <p slot="title" style="font-size: 18px">筛选器</p>
        <p class="type-selector">论文/论文解读：</p>
        <i-select
          v-model="knowledgeType"
          @on-change="selectType"
          style="width: 80%"
        >
          <Option value="paper"> 论文 </Option>
          <Option value="interpretation"> 论文解读 </Option>
        </i-select>
        <br />
        <br />
        <p class="type-selector">标签：</p>
        <i-select
          v-model="selectTagList"
          style="width: 80%"
          multiple
          @on-change="changeTag"
          filterable
        >
          <Option v-for="item in tagList" :value="item.value" :key="item.value">
            {{ item.label }}
          </Option>
        </i-select>
      </Card>
    </i-col>
  </Row>
</template>

<script>
import KnowledgeCard from "@/view/micro-knowledge/knowledge-card";
import InterpretationCard from "@/view/micro-knowledge/knowledge-card";
import { getKnowledgePage, getTags } from "@/api/microknowledge";
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
import { getSearchResult } from "../../api/microknowledge";
export default {
  name: "Search",

  components: { KnowledgeCard, InterpretationCard },

  data() {
    return {
      knowledgeType: "paper",
      selectTagList: [],
      tagSearch: "",
      tagList: [],
      pageIndex: 1,
      totalData: 0,
      pageSize: 5,
      items: [],
      query: this.$route.params.query,
      searchPaper: true,
      searchInterpretation: false,
      loading: true,
    };
  },

  watch: {
    $route(to, from) {
      this.query = this.$route.params.query;
      this.pageIndex = 1;
      this.items = [];
      this.loadData();
    },
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
    this.loadData();
  },

  methods: {
    changeIndexPage: function () {
      setTimeout(() => {
        document
          .getElementsByClassName("content-wrapper ivu-layout-content")[0]
          .scroll(0, 0);
      }, 400);
      this.pageIndex = i;
      this.loadData();
    },

    loadData: function () {
      this.loading = true;
      getSearchResult({
        pindx: this.pageIndex,
        tags: (this.tagSearch = "" ? null : this.tagSearch),
        keywords: this.$route.params.query,
        paper: this.searchPaper,
        interpertation: this.searchInterpretation,
      }).then((res) => {
        this.totalData = res.data.total_res;
        if (paper) {
          const mapData = res.data.res.map((item) => {
            return {
              id: item.id,
              creator: item.created_by,
              createAt: getLocalTime(item.created_at),
              publishedYear: item.published_year,
              content:
                item.abstract.replace(/<[^>]+>/g, "").length > 100
                  ? item.abstract.replace(/<[^>]+>/g, "").substring(0, 100) +
                    "..."
                  : item.abstract.replace(/<[^>]+>/g, ""),
              tags: item.tags,
              // isLike: 0,
              // isCollect: 0,
              // likeNumber: 0,
              // favorNumber: 0,
              // displayType: 0,
              source: item.source,
              author: item.author,
              title: item.title,
            };
          });
          this.items.push(...mapData);
          this.load = false;
        } else {
          const mapData = res.data.res.map((item) => {
            return {
              id: item.id,
              title: item.title,
              content:
                item.content.replace(/<[^>]+>/g, "").length > 100
                  ? item.content.replace(/<[^>]+>/g, "").substring(0, 100) +
                    "..."
                  : item.content.replace(/<[^>]+>/g, ""),
              created_by: item.created_by,
              created_at: getLocalTime(item.created_at),
              tags: item.tags,
            };
          });
          this.items.push(...mapData);
          this.load = false;
        }
      });
    },
    // loadData: function () {
    //   this.loading = true;
    //   getKnowledgePage("get", {
    //     pindx: this.pageIndex,
    //     num_per_page: this.pageSize,
    //     tags: this.tagSearch === "" ? null : this.tagSearch,
    //     keywords: this.$route.params.query,
    //     micro_evidence: this.searchEvidence,
    //     micro_conjecture: this.searchConjecture,
    //   })
    //     .then((res) => {
    //       const mapData = res.data.page.map((item) => {
    //         return {
    //           id: item.id,
    //           creator: item.created_by,
    //           kind: item.type - 1,
    //           createAt: getLocalTime(item.created_at),
    //           publishedYear: item.published_year,
    //           content: item.content,
    //           tags: item.tags,
    //           isLike: item.is_like,
    //           isCollect: item.is_favor,
    //           likeNumber: item.like_num,
    //           favorNumber: item.favor_num,
    //           displayType: 0,
    //           source: item.source,
    //           citation: item.citation,
    //           evidences: item.evidences,
    //           key: `${item.type}-${item.id}`,
    //         };
    //       });
    //       this.items.push(...mapData);
    //       this.loading = false;
    //       this.hasNextPage = res.data.has_next;
    //     })
    //     .catch((error) => {
    //       this.$Modal.error(getErrModalOptions(error));
    //     });
    // },

    selectType: function (value) {
      this.knowledgeType = value;
      if (value === "paper") {
        this.searchPaper = true;
        this.searchInterpretation = false;
      } else {
        this.searchPaper = false;
        this.searchInterpretation = true;
      }
      // reset
      this.pageIndex = 1;
      this.items = [];
      this.loadData();
    },

    changeTag: function (tags) {
      this.selectTagList = tags;
      this.tagSearch = "";
      tags.forEach((item) => {
        this.tagSearch += item + " ";
      });
      this.tagSearch = this.tagSearch.trim();
      this.pageIndex = 1;
      this.items = [];
      this.loadData();
    },
  },
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
