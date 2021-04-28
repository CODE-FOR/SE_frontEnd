<template>
  <div>
    <h2>
      {{ title }}
    </h2>

    <br />
    <div v-html="abstract"></div>

    <!-- <template v-if="items.length !== 0"> -->
      <InterpretationCard v-for="item in items" :key="item.id" v-bind="item" />
    <!-- </template> -->
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
    };
  },

  mounted() {
    // this.loadData()
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
      console.log(items)
    },
  },
};
</script>
