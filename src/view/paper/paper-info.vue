<template>
  <div>
    <h2>
      {{ title }}
    </h2>

    <br />
    <div v-html="abstract"></div>
  </div>
</template>


<script>
import { getTags, recommend, microKnowledgeIdReq } from "@/api/microknowledge";
export default {
  data() {
    return {
      id: this.$route.params.id,
      title: "title",
      abstract: "abstract",
    };
  },

  mounted() {
    this.loadData();
  },

  methods: {
    loadData() {
      alert("?");
      microKnowledgeIdReq(this.id, 0, "get")
        .then((res) => {
          this.title = res.data.title;
          this.abstract = res.data.abstract;
        })
        .catch((error) => {
          console.log(error);
        });
      console.log(this.title);
    },
  },

  loadInterpretation() {

  }
};
</script>
