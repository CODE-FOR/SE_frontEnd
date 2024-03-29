<template>
  <Row>
    <i-col offset="1" span="9">
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
        <KnowledgeCard
          v-bind="paperInfo"
          style="text-align: center"
          :key="paperInfo.id"
        />
      </Row>
    </i-col>
    <i-col offset="1" span="12">
      <Card>
        <Form
          ref="form"
          :model="form"
          :rules="ruleCustom"
          :label-width="110"
          style="margin-right: 50px"
        >
          <Form-item label="论文" prop="paperCitation">
            <Row>
              <Input
                :disabled="true"
                type="text"
                v-model="paperCitationTitle"
              />
            </Row>
          </Form-item>
          <Form-item label="论文解读标题" prop="interpretationTitle"
            ><Input
              type="text"
              placeholder="请输入论文解读题目"
              v-model="form.interpretationTitle"
          /></Form-item>
          <Form-item label="论文解读内容" prop="content">
            <TEditor id="tinymce" v-model="form.content" :init="editorInit" />
          </Form-item>
          <Form-item label="标签" prop="tags"
            ><Input
              type="text"
              placeholder="请输入至少三个标签(以空格分隔)"
              v-model="form.tags"
          /></Form-item>
          <i-col offset="3">
            <Button
              type="primary"
              @click="handleSubmit('form')"
              style="text-align: center"
              size="large"
              long
              >发布</Button
            >
          </i-col>
        </Form>
      </Card>
    </i-col>
  </Row>
</template>

<script>
import TEditor from "@/components/TEditor.vue";
import KnowledgeCard from "./knowledge-card.vue";
import {
  favorKnowledgeList,
  createInterpretation,
  getTags,
} from "@/api/microknowledge.js";
import { getUserInfo } from "@/api/user";
import { getErrModalOptions, getLocalTime } from "@/libs/util.js";
import { microKnowledgeIdReq } from "../../api/microknowledge.js";
import tinymce from "tinymce";

export default {
  components: {
    KnowledgeCard,
    TEditor,
  },
  data() {
    const validateTitle = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入论文解读题目"));
      } else {
        callback();
      }
    };
    const validateContent = (rule, value, callback) => {
      value = tinymce.activeEditor.getContent();
      if (value === "") {
        callback(new Error("请输入论文解读内容(不超过3000字)"));
      } else if (value.length > 200000) {
        callback(new Error("内容不得超过30000字"));
      } else {
        callback();
      }
    };

    const validateTags = (rule, value, callback) => {
      if (value === "" || value.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ').split(" ").length < 3) {
        callback(new Error("请输入至少3个标签(以空格分隔)"));
      } else {
        callback();
      }
    };

    return {
      id: parseInt(this.$route.params.id),
      loading: true,
      pageIndex: 1,
      hasNext: false,
      pageSize: 5,
      topicList: [],
      paperCitationTitle: "default title",
      paperTitleView: true,
      interpretation_id: -1,
      interpretationTitle: "",
      form: {
        tags: [], // tags
        content: "",
        // tags: '',
        paperCitation: "",
        // citation2: '',
        paperId1: "",
        // citationid2: ''
        interpretationTitle: "",
      },
      paperInfo: {
        //TODO: confirmation with backend
        id: -1,
        title: "default title",
        content: "<b>default content</b>",
        creator: "default interpreter",
        createAt: "0000-00-00",
        publishYear: "-1",
        tags: ["default_tag_1", "default_tag_2"],
        author: ["default author"],
        source: "default source",
        items: [],
        isInPublishInterpretaion: true
      },
      ruleCustom: {
        interpretationTitle: [
          {
            required: true,
            validator: validateTitle,
            trigger: "blur",
          },
        ],

        content: [
          {
            required: true,
            validator: validateContent,
            trigger: "blur",
          },
        ],

        tags: [
          {
            required: true,
            validator: validateTags,
            trigger: "blur",
          },
        ],
      },
    };
  },

  async mounted() {
    if (this.$store.state.paperIdWhileWritingInterpretation === 0) {
      if (sessionStorage.getItem("paperId")) {
        this.$store.commit(
          "getPaperId",
          parseInt(sessionStorage.getItem("paperId"))
        );
      }
    }
    sessionStorage.setItem(
      "paperId",
      this.$store.state.paperIdWhileWritingInterpretation
    );
    if (!this.$store.state.user.id) {
      await getUserInfo()
        .then((res) => {
          this.$store.commit("setUserProfile", res.data);
        })
        .catch((error) => {
          this.$Modal.error(getErrModalOptions(error));
        });
    }
    this.loadData();
    this.getTopicList();
  },

  methods: {
    loadData: function () {
      this.loading = true;
      microKnowledgeIdReq(
        parseInt(this.$store.state.paperIdWhileWritingInterpretation),
        0,
        "get"
      )
        .then((res) => {
          this.paperCitationTitle = res.data.title;
          this.paperInfo.id = parseInt(this.$store.state.paperIdWhileWritingInterpretation);
          this.paperInfo.title = res.data.title;
          this.paperInfo.content = res.data.abstract;
          this.paperInfo.creator = res.data.created_by;
          this.paperInfo.createAt = getLocalTime(res.data.created_at);
          this.paperInfo.publishedYear = res.data.publishedYear;
          this.paperInfo.tags = res.data.tags;
          this.paperInfo.author = res.data.author;
          this.paperInfo.source = res.data.source;
          this.loading = false;
        })
        .catch((error) => {
          console.log(error);
        });
      this.paperInfo.id = parseInt(this.$store.state.paperIdWhileWritingInterpretation);
    },

    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          const tags = this.form.tags.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ').split(' ')
            .map(tag => { return { name: tag.replace(/<[^>]+>/g, "").length > 0 ? tag.replace(/<[^>]+>/g, "") : '不合法标签', type: 1 } });
          const data = {
            title: this.form.interpretationTitle,
            content: tinymce.activeEditor.getContent(),
            tags: tags,
            paper_id: this.paperInfo.id
          };

          createInterpretation('post', data)
            .then((res) => {
              this.$Message.success("发布成功!");
              this.$router.push({
                name: 'paper',
                params: {
                  id: this.paperInfo.id,
                  administrator: 0
                }
              })
            })
            .catch((err) => {
              if (err.response.status === 444) {
                this.$Message.error("您在1小时内已经发布了20篇论文解读，检测到风险行为，已停止您发布论文的权限！");
              } else if (err.response.status === 567) {
                this.$Message.error("您已被禁言")
              }
              //this.$Modal.error(getErrModalOptions(err));
            });
        } else {
          this.$Message.error("发布失败!");
        }
      }).catch((err) => {
        if (err.response.status === 567) {
          this.$Message.error("您已被禁言")
        }
      });
    },

    handlePaperCitation(id, title) {
      this.interpretation_id = id;
      this.paperCitationTitle = title;
      this.paperTitleView = false;
    },

    handleReset(name) {
      this.$refs[name].resetFields();
    },


    changeToprops(array) {
      return array.map((item) => {
        return {
          id: item.id,
          creator: item.created_by,
          kind: 0,
          createAt: getLocalTime(item.created_at),
          publishedYear: item.published_year,
          content: item.content,
          tags: item.tags,
          isLike: item.is_like,
          isCollect: item.is_collect,
          likeNumber: item.like_num,
          favorNumber: item.collect_num,
          displayType: 1,
          source: item.source,
          citation: item.citation,
        };
      });
    },

    loadMoreData() {
      this.pageIndex += 1;
      this.loadData();
    },
    getTopicList() {
      getTags("get", {
        pindx: 1,
        num_per_page: 99,
        presupposed: true,
      })
        .then((res) => {
          this.topicList = res.data.page.map((tag) => ({
            value: tag.name,
            label: tag.name,
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style>
</style>
