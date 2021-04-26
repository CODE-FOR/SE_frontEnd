<template>
  <Row>
    <i-col offset="4" span="15">
      <Card>
        <Tabs v-model="activeTab" @on-click="changeTab">
          <TabPane label="推荐" name="recommend">
            <template v-if="items.length !== 0">
              <KnowledgeCard
                v-for="item in items"
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
              <Row v-else>
                <i-col style="text-align: center"> 暂无更多微知识 </i-col>
              </Row>
            </template>
            <template v-else>
              <Row>
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
          </TabPane>
          <TabPane label="关注" name="favorite">
            <template v-if="items.length !== 0">
              <KnowledgeCard
                v-for="item in items"
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
              <Row v-else>
                <i-col style="text-align: center"> 暂无更多微知识 </i-col>
              </Row>
            </template>
            <template v-else>
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
              <div style="text-align: center; font-size: 20px" v-else>
                <br />
                <br />
                <br />
                暂无关注用户动态
                <br />
                <br />
                <br />
              </div>
            </template>
          </TabPane>
        </Tabs>
      </Card>
    </i-col>
  </Row>
</template>

<script>
import KnowledgeCard from "@/view/micro-knowledge/knowledge-card";
import { recentKnowledge } from "@/api/user";
import { getTags, recommend } from "@/api/microknowledge";
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
export default {
  name: "home",

  components: { KnowledgeCard },

  data() {
    return {
      // activeTab: "favorite",
      activeTab: "recommend",
      knowledgeType: "micro-evidence", // TODO: 这个应该用 vuex 记住用户的上一次选择
      selectTagList: [],
      tagSearch: "",
      tagList: [],
      pageIndex: 1,
      hasNextPage: true,
      items: [],
      pageSize: 15,
      idList: [],
      loading: true,
    };
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
    // loadData: function () {
    //   this.loading = true
    //   recommend({
    //     num: this.pageSize
    //   }).then(res => {
    //     const oldLength = this.idList.length
    //     const mapData = res.data.models.map(item => {
    //       if (this.idList.includes(item.id)) {
    //         return false
    //       } else {
    //         this.idList.push(item.id)
    //       }
    //       return {
    //         id: item.id,
    //         creator: {
    //           id: item.created_by__id,
    //           username: item.created_by__username
    //         },
    //         kind: item.microconjecture ? 1 : 0,
    //         createAt: getLocalTime(item.created_at),
    //         publishedYear: item.published_year,
    //         content: item.content,
    //         tags: item.tag_list,
    //         isLike: item.is_like,
    //         isCollect: item.is_favor,
    //         likeNumber: item.like_num,
    //         favorNumber: item.favor_num,
    //         displayType: 0,
    //         source: item.source,
    //         citation: item.citation,
    //         evidences: []
    //       }
    //     })
    //     this.items.push(...mapData.filter(x => x))
    //     if (res.data.total_count < this.pageSize) {
    //       this.hasNextPage = false
    //     } else if (oldLength === this.idList.length) {
    //       this.hasNextPage = false
    //     }
    //     this.loading = false
    //   }).catch(error => {
    //     console.log(error.response.status)
    //     if (error.response.status === 400) {
    //       this.hasNextPage = false
    //     }
    //   })
    // },

    loadData: function () {
      this.loading = true;
      let mapDAta = {
        id: 1,
        creator: {
          id: 1,
          username: 'lzw_user',
        },
        kind: 1,
        createAt: getLocalTime('August 19, 1975 23:15:30 GMT+00:00'),
        publishedYear: 2021,
        content: '<p>test</p>', 
        tags: ['a', 'b', 'c', 'd'],
        isLike: 0,
        isCollect: 0,
        likeNumber: 0,
        favorNumber: 0,
        displayType: 0,
        source: 'http://www.baidu.com',
        citation: 'http://www.baidu.com',
        evidences: [],
      };
      this.items.push(mapDAta);
      this.loading = false;
    },

    loadFavor: function () {
      this.loading = true;
      recentKnowledge({
        pindex: this.pageIndex,
        num_per_page: this.pageSize,
        micro_evidence: true,
        micro_conjecture: true,
      })
        .then((res) => {
          const mapData = res.data.page.map((item) => {
            return {
              id: item.id,
              creator: item.created_by,
              kind: item.type - 1,
              createAt: getLocalTime(item.created_at),
              publishedYear: item.published_year,
              content: item.content,
              tags: item.tags,
              isLike: item.is_like,
              isCollect: item.is_favor,
              likeNumber: item.like_num,
              favorNumber: item.favor_num,
              displayType: 0,
              source: item.source,
              citation: item.citation,
              evidences: item.evidences,
            };
          });
          this.items.push(...mapData);
          this.hasNextPage = res.data.has_next;
          this.loading = false;
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    },

    selectType: function (value) {
      this.knowledgeType = value;
      // reset
      this.pageIndex = 1;
      this.items = [];
      this.idList = [];
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
      this.idList = [];
      this.loadData();
    },

    loadMoreData: function () {
      this.pageIndex += 1;
      if (this.activeTab === "favorite") {
        this.loadFavor();
      } else {
        this.loadData();
      }
    },

    changeTab: function (name) {
      this.activeTab = name;
      this.pageIndex = 1;
      this.items = [];
      this.idList = [];
      if (this.activeTab === "favorite") {
        this.loadFavor();
      } else {
        this.loadData();
      }
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
