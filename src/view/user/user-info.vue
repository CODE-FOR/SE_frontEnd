<template>
  <div>
    <Row>
      <i-col offset="4" span="16">
        <Card>
          <Row type="flex" align="bottom">
            <i-col span="3">
              <Avatar src="https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png" style="width: 100%;height: 100%" />
              <avatar-cutter v-if="showCutter" return-type="file" @cancel="showCutter = false" @enter="handleUploadAvatar">
              </avatar-cutter>
            </i-col>
            <i-col span="5" style="height:120px">
              <div class="user-name">
                {{ nickName===''? userName:nickName }}
              </div>
              <p style="margin-top: 5px"> 邮箱: {{ userEmail }} </p>
              <p> 所属组织: {{ userCompany }} </p>
            </i-col>
            <i-col offset="10" span="2" style="height: 40px;text-align: center">
              <p class="data-title"> 总发布数 </p>
              <p> {{ totalPub }} </p>
            </i-col>
            <i-col span="2" style="height: 40px;text-align: center">
              <p class="data-title"> 总粉丝数 </p>
              <p> {{ totalFollow }} </p>
            </i-col>
            <i-col span="2" style="height: 40px;text-align: center">
              <p class="data-title"> 总点赞数 </p>
              <p> {{ totalLike }} </p>
            </i-col>
          </Row>
        </Card>
      </i-col>
    </Row>
    <br>
    <Row>
      <i-col offset="4" span="16">
        <Card>
          <Tabs v-model="tabName" @on-click="changeTab">
            <TabPane :label="postText" name="myPost">
              <Select v-if="isSponsor" v-model="postSelectType" style="margin-bottom:20px;width:auto;alian:right" value='knowledge' @on-change="changePostType">
                <!-- TODO -->
                <Option label="微知识" value="微知识">论文</Option>
                <Option label="项目" value="项目">项目</Option>
              </Select>
              <template v-if="data.length !== 0&&postSelectType==='微知识'">
                <Row v-if="loading">
                  <i-col class="demo-spin-col" offset="8" span="8">
                    <Spin fix>
                      <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                      <div>Loading</div>
                    </Spin>
                  </i-col>
                </Row>
                <div v-else v-for="item in data" :key="item.id">
                  <Row>
                    <i-col span="4">
                      <!-- {{ item.type === 0 ? '微证据' : '微猜想' }}: -->
                      {{ item.type === 0 ? '论文' : '论文解读' }}
                      <Tag :color="calTagColor(item.judge_status)"> {{ item.judge_status === 0 ? "审核中" : item.judge_status === 1 ?  "审核通过" : "未通过" }} </Tag>
                    </i-col>
                    <i-col span="7" class="post-content">
                      <!-- TODO -->
                      <div v-html="item.content"></div>
                      <!-- <span>{{ item.content }}</span> -->
                    </i-col>
                    <i-col offset="1" span="2" style="text-align: center">
                      <p class="data-title"> 点赞数: </p> {{ item.like_num }}
                    </i-col>
                    <i-col span="2" style="text-align: center">
                      <p class="data-title"> 收藏数: </p> {{ item.favor_num }}
                    </i-col>
                    <i-col offset="1" span="7" v-if="!isOther">
                      <i-button type="info" style="width: 70px" @click="handleShow(item.id, item.type)">
                        查看
                      </i-button>
                      &nbsp;
                      <i-button type="info" style="width: 70px" @click="handleModifyPost(item.id, item.type)" :disabled="item.judge_status !== 0">
                        修改
                      </i-button>
                      &nbsp;
                      <i-button type="info" style="width: 70px" @click="handleDelete(item.id, item.type)">
                        删除
                      </i-button>
                    </i-col>
                    <i-col offset="5" span="2" v-else>
                      <i-button type="info" style="width: 70px" @click="handleShow(item.id, item.type)">
                        查看
                      </i-button>
                    </i-col>
                  </Row>
                  <Divider />
                </div>
                <div style="float:right">
                  <Page :total="totalCnt" :page-size="pageSize" :current="pageIndex" @on-change="changePage" show-total />
                </div>
                <Modal v-model="showDetail" footer-hide width="720">
                  <KnowledgeCard v-if="showDetail" v-bind='post' />
                </Modal>
                <Modal v-model="showModify" title="修改" @on-ok="handleSubmit(postType === 0 ? 'evidenceForm' : 'conjectureForm')">
                  <i-form v-if="postType === 0" ref="evidenceForm" :rules="evidenceRule" :model="post" :label-width="120">
                    <form-item prop="content" label="内容">
                      <i-input type="textarea" v-model="post.content" placeholder="内容不超过200字" :maxlength="200" :rows="4" />
                    </form-item>
                    <form-item label="参考文献" prop="citation">
                      <i-input type="text" v-model="post.citation" placeholder='请输入参考文献(GB7714格式)' />
                    </form-item>
                    <form-item label="参考文献链接(可选)" prop="source">
                      <i-input type="text" placeholder='请输入参考文献链接(可选)' v-model="post.source" />
                    </form-item>
                    <form-item label="参考文献年份" prop="published_year">
                      <input type="number" v-model="post.published_year" />
                    </form-item>
                  </i-form>
                  <i-form v-else ref="conjectureForm" :rules="conjectureRule" :model="post" :label-width="120">
                    <form-item label="内容" prop="content">
                      <i-input type="textarea" placeholder="内容不超过200字" :maxlength="200" :rows="4" v-model="post.content" />
                    </form-item>
                  </i-form>
                </Modal>
              </template>
              <template v-else-if="projectList.length!==0&&postSelectType==='项目'">
                <Row v-if="loading">
                  <i-col class="demo-spin-col" offset="8" span="8">
                    <Spin fix>
                      <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                      <div>Loading</div>
                    </Spin>
                  </i-col>
                </Row>
                <div v-else v-for="(item,index) in projectList" :key="item.id">
                  <Row>
                    <i-col span="4">
                      项目:
                    </i-col>
                    <i-col span="7" class="post-content">
                      {{ item.content===''?"空":item.content }}
                    </i-col>
                    <!-- <i-col offset="1" span="2" style="text-align: center">
                      <p class="data-title"> 微知识数: </p> {{ 5 }}
                    </i-col>
                    <i-col span="2" style="text-align: center">
                      <p class="data-title"> 讨论数: </p> {{ 7 }}
                    </i-col> -->
                    <i-col offset="5" span="7" v-if="!isOther">
                      <i-button type="info" style="width: 70px" @click="$router.push({name:'project_home',params:{project_id:item.id}})">
                        查看
                      </i-button>
                      &nbsp;
                      <i-button type="info" style="width: 70px" @click="item.showModify=true">
                        修改
                      </i-button>
                      &nbsp;
                      <i-button type="info" style="width: 70px" @click="handleDelete(item.id, item.type)">
                        删除
                      </i-button>
                    </i-col>
                    <i-col offset="5" span="2" v-else>
                      <i-button type="info" style="width: 70px" @click="$router.push({name:'project_home',params:{project_id:item.id}})">
                        查看
                      </i-button>
                    </i-col>
                    <Modal v-model="item.showModify" title="修改" @on-ok="handleProjectModify(index)" width="1000px">
                      <project-form ref="project_form" v-bind="item"></project-form>
                    </Modal>
                  </Row>
                  <Divider />
                </div>
                <div style="float:right">
                  <Page :total="projectTotalCnt" :page-size="1" :current="pageIndex" @on-change="changePage" />
                </div>
              </template>
              <Row v-else-if="loading">
                <i-col class="demo-spin-col" offset="8" span="8">
                  <Spin fix>
                    <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                    <div>Loading</div>
                  </Spin>
                </i-col>
              </Row>
              <template v-else>
                <div style="text-align: center; font-size: 20px">
                  暂无发布
                </div>
              </template>
            </TabPane>
            <TabPane :label="favorText" name="myFavor">
              <template v-if="data.length !== 0">
                <Row v-if="loading">
                  <i-col class="demo-spin-col" offset="8" span="8">
                    <Spin fix>
                      <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                      <div>Loading</div>
                    </Spin>
                  </i-col>
                </Row>
                <KnowledgeCard v-else v-for="item in data" :key="item.id" v-bind='item' />
                <div style="float:right">
                  <Page :total="totalCnt" :page-size="pageSize" :current="pageIndex" @on-change="changePage" />
                </div>
              </template>
              <Row v-else-if="loading">
                <i-col class="demo-spin-col" offset="8" span="8">
                  <Spin fix>
                    <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                    <div>Loading</div>
                  </Spin>
                </i-col>
              </Row>
              <template v-else>
                <div style="text-align: center; font-size: 20px">
                  暂无收藏
                </div>
              </template>
            </TabPane>
            <TabPane label="关注列表" name="followBack">
              <template v-if="data.length !== 0">
                <Row v-if="loading">
                  <i-col class="demo-spin-col" offset="8" span="8">
                    <Spin fix>
                      <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                      <div>Loading</div>
                    </Spin>
                  </i-col>
                </Row>
                <div v-else v-for="item in data" :key="item.id">
                  <Row>
                    <i-col span="2">
                      <Avatar src="https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png" style="width: 100%;height: 100%" />
                    </i-col>
                    <i-col span="5">
                      <div class="user-name">
                        {{ item.nick_name === '' ? item.username : item.nick_name }}
                      </div>
                      <p style="margin-top: 5px"> 邮箱: {{ item.email || '暂无邮箱信息' }} </p>
                      <p> 所属组织: {{ item.institution || '暂无组织信息'}} </p>
                    </i-col>
                    <i-col offset="13" span="3" v-if="isOther">
                      <i-button type="primary" style="width: 100px; height: 35px; top: 31px; position: relative;" @click="jumpUserInfo(item.id)">
                        他的主页
                      </i-button>
                    </i-col>
                    <i-col offset="10" span="7" v-else>
                      <i-button type="primary" style="width: 40%; height: 35px; top: 31px; position: relative;" @click="jumpUserInfo(item.id)">
                        他的主页
                      </i-button>
                      &nbsp;&nbsp;
                      <i-button type="primary" style="width: 40%; height: 35px; top: 31px; position: relative;" @click="handleUnFollow(item.id)">
                        取消关注
                      </i-button>
                    </i-col>
                  </Row>
                  <Divider />
                </div>
                <div style="float:right">
                  <Page :total="totalCnt" :page-size="pageSize" :current="pageIndex" @on-change="changePage" show-total />
                </div>
              </template>
              <Row v-else-if="loading">
                <i-col class="demo-spin-col" offset="8" span="8">
                  <Spin fix>
                    <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                    <div>Loading</div>
                  </Spin>
                </i-col>
              </Row>
              <template v-else>
                <div style="text-align: center; font-size: 20px">
                  当前暂无关注
                </div>
              </template>
            </TabPane>
            <TabPane label="粉丝列表" name="fan">
              <template v-if="data.length !== 0">
                <Row v-if="loading">
                  <i-col class="demo-spin-col" offset="8" span="8">
                    <Spin fix>
                      <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                      <div>Loading</div>
                    </Spin>
                  </i-col>
                </Row>
                <div v-else v-for="item in data" :key="item.id">
                  <Row>
                    <i-col span="2">
                      <Avatar src="https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png" style="width: 100%;height: 100%" />
                    </i-col>
                    <i-col span="5">
                      <div class="user-name">
                        {{ item.nick_name === '' ? item.username : item.nick_name }}
                      </div>
                      <p style="margin-top: 5px"> 邮箱: {{ item.email || '暂无邮箱信息' }} </p>
                      <p> 所属组织: {{ item.institution || '暂无组织信息'}} </p>
                    </i-col>
                    <i-col offset="13" span="3">
                      <i-button type="primary" style="width: 100px; height: 35px; top: 31px; position: relative;" @click="jumpUserInfo(item.id)">
                        他的主页
                      </i-button>
                    </i-col>
                  </Row>
                  <Divider />
                </div>
                <div style="float:right">
                  <Page :total="totalCnt" :page-size="pageSize" :current="pageIndex" @on-change="changePage" show-total />
                </div>
              </template>
              <Row v-else-if="loading">
                <i-col class="demo-spin-col" offset="8" span="8">
                  <Spin fix>
                    <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                    <div>Loading</div>
                  </Spin>
                </i-col>
              </Row>
              <template v-else>
                <div style="text-align: center; font-size: 20px">
                  当前暂无粉丝
                </div>
              </template>
            </TabPane>
            <TabPane v-if="!isOther" label="修改资料" name="modify">
              <!-- <Divider>
                重置邮箱
              </Divider>
              <Row>
                <i-col
                  offset="7"
                  span="8"
                >
                  <i-form
                    :model="modifyEmail"
                    :rules="modifyEmailRule"
                    :label-width="120"
                  >
                    <form-item
                      label="邮箱"
                      prop="newEmail"
                      style="margin-bottom: 15px"
                    >
                      <i-input v-model="modifyEmail.newEmail"/>
                    </form-item>
                    <form-item>
                      <p style="display: inline"> 验证状态：已验证 </p>
                      <Icon size="20" color="#5fc75f" type="ios-checkmark-circle" style="margin-top:-2px"/>
                      <p> 备注：修改后，将发送验证邮件至新邮箱 </p>
                      <i-button
                        type="primary"
                      >
                        确认修改
                      </i-button>
                    </form-item>
                  </i-form>
                </i-col>
              </Row> -->
              <!-- <Divider>
                修改头像
              </Divider>
              <Row>
                <i-col offset="10" span="4">
                  <Button @click="clickCutter" type="primary">上传头像</Button>
                </i-col>
              </Row> -->
              <Divider>
                重置密码
              </Divider>
              <Row>
                <i-col offset="7" span="8">
                  <i-form ref="modifyPassword" :model="modifyPassword" :rules="modifyPassRule" :label-width="120" style="margin: 0px">
                    <form-item label="输入旧密码" prop="oldPassword">
                      <i-input type="password" v-model="modifyPassword.oldPassword" />
                    </form-item>
                    <form-item label="输入新密码" prop="newPassword1">
                      <i-input type="password" v-model="modifyPassword.newPassword1" />
                    </form-item>
                    <form-item label="确认新密码" prop="newPassword2">
                      <i-input type="password" v-model="modifyPassword.newPassword2" />
                    </form-item>
                    <form-item>
                      <i-button type="primary" @click="handleSubmit('modifyPassword')">
                        确认修改
                      </i-button>
                    </form-item>
                  </i-form>
                </i-col>
              </Row>
            </TabPane>
          </Tabs>
        </Card>
      </i-col>
    </Row>
  </div>
</template>

<script>
import { modifyPassword, fanList, followerList, unfollow, myKnowledge, getUserInfo, uploadAvatar } from '@/api/user'
import { getErrModalOptions, getLocalTime } from '@/libs/util.js'
import { queryProjects, deleteProject } from '@/api/project'
import { microKnowledgeIdReq, favorKnowledgeList } from '@/api/microknowledge'
import KnowledgeCard from '@/view/micro-knowledge/knowledge-card'
import ProjectForm from '@/view/sponsor-project/project-form'
import AvatarCutter from '@/components/avatar-cutter/avatar-cutter'
export default {
  name: 'UserInfo',

  components: {
    KnowledgeCard,
    ProjectForm,
    AvatarCutter
  },

  data () {
    return {
      loading: true,
      userEmail: 'xxxxxxxxx@qq.com',
      userCompany: 'xxx研究所',
      userName: 'xxx',
      isSponsor: false,
      nickName: '',
      totalLike: 102,
      totalFollow: 10,
      totalPub: 11,
      avatarUrl: '',
      isOther: false, // 是否为他人的主页
      showDetail: false,
      tabName: 'myPost',
      modifyPassword: {
        oldPassword: '',
        newPassword1: '',
        newPassword2: ''
      },
      modifyPassRule: {
        oldPassword: [
          { required: true, message: '请填写旧密码', trigger: 'blur' }
        ],
        newPassword1: [
          { required: true, message: '请填写密码', trigger: 'blur' },
          { min: 6, message: '请至少输入6位密码' }
        ],
        newPassword2: [
          { required: true, validator: this.validtePassWord, trigger: 'blur' },
          { min: 6, message: '请至少输入6位密码' }
        ]
      },
      modifyEmail: {
        newEmail: this.userEmail
      },
      modifyEmailRule: {
        newEmail: [
          { required: true, message: '请填写邮箱', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              const pattern = /^([A-Za-z0-9_.])+@([A-Za-z0-9._])+\.([A-Za-z]+)$/
              if (!pattern.test(value)) {
                callback(new Error('请填写合法的邮箱'))
              } else {
                callback()
              }
            }
          }
        ]
      },
      pageIndex: 1,
      pageSize: 10,
      data: [],
      totalCnt: 1,
      showCutter: false,
      post: {},
      postType: 0, // 0 : evidence
      postSelectType: '微知识',
      projectTotalCnt: 1,
      projectList: [],
      showModify: false,
      conjectureRule: {
        content: [
          { required: true, message: '请填写内容', trigger: 'blur' }
        ]
      },
      evidenceRule: {
        content: [
          { required: true, message: '请填写内容', trigger: 'blur' }
        ],
        citation: [
          { required: true, message: '请填写参考文献', trigger: 'blur' }
        ],
        published_year: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error('请输入文献年份'))
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },

  watch: {
    '$route' (to, from) {
      this.init()
    }
  },

  computed: {
    postText () {
      return this.isOther ? '他的发布' : '我的发布'
    },

    favorText () {
      return this.isOther ? '他的收藏' : '我的收藏'
    }
  },

  mounted () {
    getUserInfo().then(res => {
      console.log(res)
      this.$store.commit('setUserProfile', res.data)
    }).catch(error => {
      this.$Modal.error(getErrModalOptions(error))
    })
    this.init()
  },

  methods: {
    init: async function () {
      if (!this.$store.state.user.userId) {
        await getUserInfo().then(res => {
          console.log(res)
          this.$store.commit('setUserProfile', res.data)
        }).catch(error => {
          this.$Modal.error(getErrModalOptions(error))
        })
      }
      if (parseInt(this.$route.params.id) === parseInt(this.$store.state.user.userId)) {
        // 是登录用户的主页
        this.isOther = false
        // this.avatarUrl = this.$store.state.user.icon
        this.userName = this.$store.state.user.userName
        this.nick_name = this.$store.state.user.nick_Name
        this.userCompany = this.$store.state.user.userInstitution || '暂无组织'
        this.userEmail = this.$store.state.user.userEmail
        this.totalLike = this.$store.state.user.userTotalLike
        this.totalFollow = this.$store.state.user.userTotalFan
        this.totalPub = this.$store.state.user.userTotalPost
        this.isSponsor = this.$store.state.user.userIsSponsor
      } else {
        this.isOther = true
        getUserInfo(this.$route.params.id).then(res => {
          this.userName = res.data.username
          this.nick_name = res.data.nickname
          this.userCompany = res.data.institution || '暂无组织'
          this.userEmail = res.data.email
          this.totalLike = res.data.total_like
          this.totalFollow = res.data.total_fan
          this.totalPub = res.data.total_post
          this.isSponsor = res.data.is_sponsor
        }).catch(error => {
          this.$Modal.error(getErrModalOptions(error))
        })
      }
      this.changeTab(this.tabName)
    },

    loadFollower: function () {
      this.loading = true
      followerList(this.$route.params.id, {
        page: this.pageIndex,
        page_size: this.pageSize
      }).then(res => {
        this.data = res.data.models
        this.totalCnt = res.data.total_count
        this.loading = false
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    loadFan: function () {
      this.loading = true
      fanList(this.$route.params.id, {
        page: this.pageIndex,
        page_size: this.pageSize
      }).then(res => {
        this.data = res.data.models
        this.totalCnt = res.data.total_count
        this.loading = false
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    loadPost: function () {
      this.loading = true
      if (this.postSelectType === '微知识') {
        myKnowledge(this.$route.params.id, {
          page: this.pageIndex,
          page_size: this.pageSize
        }).then(res => {
          this.data = res.data.models.map(item => {
            return {
              content: item.content,
              favor_num: item.favor_num,
              like_num: item.like_num,
              judge_status: item.judge_status,
              id: item.id,
              type: item.microconjecture === null ? 0 : 1
            }
          })
          this.totalCnt = res.data.total_count
          this.loading = false
        }).catch(error => {
          this.$Modal.error(getErrModalOptions(error))
        })
      } else {
        this.loadProjects()
      }
    },

    loadProjects: function (pindex = this.pindex) {
      this.loading = true
      queryProjects({
        user_id: this.$route.params.id,
        psize: this.psize,
        pindex: pindex
      }).then(res => {
        this.projectTotalCnt = res.data.page_count
        this.projectList = res.data.project_list.map(x => ({
          title: x.name,
          id: x.id,
          sponsor: x.create_user.nick_name,
          content: x.content.replace(/&nbsp;/g, ''),
          html: x.html_content,
          type: 'project',
          timeline: x.timeline_list,
          modify: true,
          showButton: false,
          showModify: false
        }))
        this.loading = false
      }).catch(err => {
        console.log(err)
      })
    },

    loadFavor: function () {
      this.loading = true
      favorKnowledgeList({
        num_per_page: this.pageSize,
        pindex: this.pageIndex,
        user_id: this.$route.params.id,
        micro_evidence: true,
        micro_conjecture: true
      }).then(res => {
        this.data = res.data.page.map(item => {
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
            evidences: item.evidences
          }
        })
        this.loading = false
        this.totalCnt = res.data.page_num * this.pageSize // 这个不是真的总数
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    validtePassWord: function (rule, value, callback) {
      if (value === '') {
        return callback(new Error('请再次输入密码'))
      } else if (value !== this.modifyPassword.newPassword1) {
        return callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    },

    handleSubmit: function (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          if (name === 'modifyPassword') {
            modifyPassword({
              'old-password': this.modifyPassword.oldPassword,
              'new-password': this.modifyPassword.newPassword2
            }).then(res => {
              this.modifyPassword = {
                oldPassword: '',
                newPassword1: '',
                newPassword2: ''
              } // 清空之前的表单
              this.$Message.info('成功修改')
            }).catch(error => {
              if (error.response.data.code === 403) {
                this.$Message.error('旧密码错误, 请确认旧密码填写一致')
              } else {
                this.$Modal.error(getErrModalOptions(error))
              }
            })
          } else {
            const params = this.postType === 0 ? {
              content: this.post.content,
              citation: this.post.citation,
              source: this.post.source,
              published_year: this.post.published_year
            } : { content: this.post.content }
            microKnowledgeIdReq(this.post.id, this.postType, 'put', params).then(res => {
              this.$Message.info('成功修改')
              this.pageIndex = 1
              this.loadPost()
            }).catch(error => {
              this.$Modal.error(getErrModalOptions(error))
            })
          }
        } else {
          this.$Notice.warning({
            title: '表单验证失败'
          })
        }
      })
    },

    changePage: function (page) {
      this.pageIndex = page
      if (this.tabName === 'followBack') {
        this.loadFollower()
      } else if (this.tabName === 'fan') {
        this.loadFan()
      } else if (this.tabName === 'myPost') {
        this.loadPost()
      } else if (this.tabName === 'myFavor') {
        this.loadFavor()
      }
    },

    handleUnFollow: function (id) {
      unfollow(id).then(res => {
        this.$Message.info('成功取消关注')
        this.pageIndex = 1
        this.loadFollower()
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    changeTab: function (name) {
      this.tabName = name
      this.pageIndex = 1
      this.data = []
      if (this.tabName === 'followBack') {
        this.loadFollower()
      } else if (this.tabName === 'fan') {
        this.loadFan()
      } else if (this.tabName === 'myPost') {
        this.loadPost()
      } else if (this.tabName === 'myFavor') {
        this.loadFavor()
      }
    },

    calTagColor: function (status) {
      return status === 0 ? 'yellow' : status === 1 ? 'green' : 'red'
    },

    handleModifyPost: function (id, type) {
      microKnowledgeIdReq(id, type, 'get').then(res => {
        this.post = res.data
        this.postType = type
        this.showModify = true
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    handleDelete: function (id, type) {
      const vm = this
      this.$Modal.confirm({
        title: '确定删除该发布',
        content: '请注意该操作不可逆',
        onOk () {
          if (type === 'project') {
            deleteProject({
              id: id
            }).then(res => {
              vm.$Message.info('成功删除')
              vm.loadProjects()
            }
            ).catch(err => {
              console.log(err)
            })
          } else {
            microKnowledgeIdReq(id, type, 'delete').then(res => {
              vm.$Message.info('成功删除')
              vm.pageIndex = 1
              vm.loadPost()
            }).catch(err => {
              vm.$Modal.error(getErrModalOptions(err))
            })
          }
        }
      })
    },

    handleProjectModify: function (index) {
      this.$refs['project_form'][index].handleSubmit('form')
    },

    handleShow: function (id, type) {
      microKnowledgeIdReq(id, type, 'get').then(res => {
        this.post = {
          id: res.data.id,
          creator: res.data.created_by,
          kind: type,
          createAt: getLocalTime(res.data.created_at),
          content: res.data.content,
          tags: res.data.tags,
          isLike: res.data.is_like,
          isCollect: res.data.is_favor,
          likeNumber: res.data.like_num,
          favorNumber: res.data.favor_num,
          displayType: res.data.judge_status !== 1 ? 2 : 0,
          evidences: res.data.evidences
        }
        this.postType = type
        this.showDetail = true
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    jumpUserInfo: function (id) {
      this.$router.push({
        name: 'user_info',
        params: {
          id: id
        }
      })
    },
    handleUploadAvatar (file) {
      const data = {
        icon: file
      }
      console.log(data)
      uploadAvatar(data).then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    },

    clickCutter: function () {
      this.showCutter = true
      console.log(this.showCutter)
    },

    changePostType: function (value) {
      this.postSelectType = value
      this.loadPost()
    }
  }
}
</script>

<style>
.user-name {
  font-size: 26px;
  color: #4d4d4d;
}
.data-title {
  font-size: 12px;
  font-weight: bold;
}
.post-content {
  font-size: 16px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}
</style>
