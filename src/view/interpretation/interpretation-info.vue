<template>
  <h2>{{ title }}</h2>

</template>

<script>
// TODO: URL confirmation!!!
// import { getTags, recommend, getInterpretation } from "@/api/interpretation";
export default {
  data () {
    return {
      id: this.$route.params.id,
      title: 'title',
      abstract: 'abstract',
      topic: ['ComputerScience'],
      content: 'this is an interpretation!',
      paperCitation: 'this is a paper citation!',
      paperId1: 'paper id!'
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
            this.paperId1 = res.data.paperId1;
          })
          .catch((error) => {
            console.log(error);
          });
        */
      console.log(this.title)
    }
  }
}
</script>
