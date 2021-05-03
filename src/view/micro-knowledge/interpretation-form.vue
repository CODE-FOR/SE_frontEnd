<template>
  <Row>
    <i-col offset="1" span="7">
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
    <i-col offset="1" span="14">
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
          <i-col offset="5">
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
  createConjecture,
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
      } else if (value.length > 3000) {
        callback(new Error("内容不得超过3000字"));
      } else {
        callback();
      }
    };

    const validateTags = (rule, value, callback) => {
      if (value === "" || value.split(" ").length < 3) {
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
        topic: [], // tags
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
        id: 20,
        title: "default title",
        content: "<b>default content</b>",
        creator: "default interpreter",
        createAt: "0000-00-00",
        publishYear: "-1",
        tags: ["default_tag_1", "default_tag_2"],
        author: ["default author"],
        source: "default source",
        items: [],
        pageComponent: {
          pageIndex: 1,
          pageSize: 1,
          items: [],
        },
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

    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem(
        "paperId",
        this.$store.state.paperIdWhileWritingInterpretation
      );
    });
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
      this.loading = false;
      microKnowledgeIdReq(
        parseInt(this.$store.state.paperIdWhileWritingInterpretation),
        0,
        "get"
      )
        .then((res) => {
          this.paperCitationTitle = res.data.title;
          this.paperInfo.title = res.data.title;
          this.paperInfo.content = res.data.abstract;
          this.paperInfo.creator = res.data.created_by;
          this.paperInfo.createAt = getLocalTime(res.data.created_at);
          this.paperInfo.publishedYear = res.data.publishedYear;
          this.paperInfo.tags = res.data.tags;
          this.paperInfo.author = res.data.author;
          this.paperInfo.source = res.data.source;
          this.loading = false;
          console.log(this.paperInfo);
        })
        .catch((error) => {
          console.log(error);
        });
    },

    handleSubmit(name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          const tags = this.form.topic
            .map((tag) => {
              return { name: tag, type: 0 };
            })
            .concat(
              this.form.tags.split(" ").map((tag) => {
                return { name: tag, type: 1 };
              })
            );
          createConjecture("post", {
            // content: this.form.content,
            content: tinymce.activeEditor.getContent(),
            tags: tags,
            paper_id: this.form.papaerId1,
          })
            .then((res) => {
              this.$Message.success("发布成功!请等待审核！");
            })
            .catch((err) => {
              this.$Modal.error(getErrModalOptions(err));
            });
        } else {
          this.$Message.error("发布失败!");
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

    // TODO: only choose one paper, but citation can have two
    handleChosePaper(event) {
      if (event.cited) {
        if (this.form.paperCitation === "") {
          [this.form.papaerId1, this.form.paperCitation] = [
            event.id,
            event.content,
          ];
        } else if (this.form.citation2 === "") {
          [this.form.citationid2, this.form.citation2] = [
            event.id,
            event.content,
          ];
        }
      } else {
        if (this.form.papaerId1 === event.id) {
          [this.form.papaerId1, this.form.paperCitation] = [
            this.form.citationid2,
            this.form.citation2,
          ];
        }
        [this.form.citationid2, this.form.citation2] = ["", ""];
      }
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
          isCollect: item.is_favor,
          likeNumber: item.like_num,
          favorNumber: item.favor_num,
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
