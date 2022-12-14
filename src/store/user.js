import { setInterval } from 'core-js';
import $ from 'jquery';
import jwt_decode from 'jwt-decode';

// vue界面中  
// store.dispatch调用的是store里面actions里面的方法
// store.commit调用的是store里面mutations里面的方法

const ModuleUser = {
    state: {
        id: "",
        username: "",
        photo: "",
        followerCount: 0,
        access: "",
        refresh: "",
        is_login: false,
    },
    getters: {
    },
    mutations: {
        updateUser(state, user) {  // 更新用户信息
            state.id = user.id;
            state.username = user.username;
            state.photo = user.photo;
            state.followerCount = user.followerCount;
            state.access = user.access;
            state.refresh = user.refresh;
            state.is_login = user.is_login;
        },

        updateAccess(state, access) {
            state.access = access;
        },

        logout(state) {
            state.id = "";
            state.username = "";
            state.photo = "";
            state.followerCount = 0;
            state.access = "";
            state.refresh = "";
            state.is_login = false;
        }
    },
    actions: {
        login(context, data) {
            $.ajax({
                url: 'https://app165.acapp.acwing.com.cn/api/token/',
                type: "post",
                data: {
                    username: data.username,
                    password: data.password,
                },
                success(resp) {
                    const { access, refresh } = resp;
                    const access_obj = jwt_decode(access);

                    setInterval(() => {
                        $.ajax({
                            url: 'https://app165.acapp.acwing.com.cn/api/token/refresh/',
                            type: "post",
                            data: {
                                refresh: refresh,
                            },
                            success(resp) {
                                context.commit("updateAccess", resp.access);
                            }
                        });
                    }, 4.5 * 60 * 1000);

                    $.ajax({
                        url: 'https://app165.acapp.acwing.com.cn/myspace/getinfo/',
                        type: "get",
                        data: {
                            user_id: access_obj.user_id,
                        },
                        headers: {  // JWT验证
                            'Authorization': "Bearer " + access,
                        },
                        success(resp) {
                            context.commit("updateUser", {
                                ...resp,
                                access: access,
                                refresh: refresh,
                                is_login: true,
                            });
                            data.success();
                        }
                    });
                },
                error() {
                    data.error();
                }
            });
        }
    },
    modules: {
    }
};

export default ModuleUser;