import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import Login from "../Login.vue";
import vuetify from '@/plugins/vuetify';
import router from "@/router";

let wrapper: VueWrapper<any>;
beforeEach(async () => {
  wrapper = mount(Login, {
    global: {
      plugins: [vuetify, router],
    },
  });
});

describe("基礎元件功能", () => {
  it("確認 Email、Password、LoginBtn 元素存在", () => {
    // 透過 get 搜尋元素，若沒找到則會拋出錯誤；find 也可以達到一樣的效果，但沒找到時並不會回傳錯誤訊息。
    expect(wrapper.get('[data-test="email"]').isVisible()).toBe(true);
    expect(wrapper.get('[data-test="password"]').isVisible()).toBe(true);
    expect(wrapper.get('[data-test="loginBtn"]').isVisible()).toBe(true);
  });

  it("確認 Email 輸入框可以填資料", async () => {
    const emailInput = wrapper.getComponent('[data-test="email"]').get('input');
    await emailInput.setValue('test@mail.com');
    expect(emailInput.element.value).toBe('test@mail.com');
  });

  it("確認 Password 輸入框可以填資料", async () => {
    const passwordInput = wrapper.getComponent('[data-test="password"]').get('input');
    await passwordInput.setValue('qazwsx1234');
    expect(passwordInput.element.value).toBe('qazwsx1234');
  });

  it("Email、Password 輸入後，data 對應的 formData 有寫入相應的值", async () => {
    const formData = {
      email: "test@mail.com",
      password: "qazwsx1234"
    };
    const emailInput = wrapper.getComponent('[data-test="email"]').get('input');
    await emailInput.setValue(formData.email);
    const passwordInput = wrapper.getComponent('[data-test="password"]').get('input');
    await passwordInput.setValue(formData.password);
    expect(wrapper.vm.formData).toEqual(formData);
  });

  it("預設 Password 輸入框的 type 為 password，不直接顯示", async () => {
    const password = wrapper.getComponent('[data-test="password"]');
    expect(password.get('input').attributes().type).toBe("password");
  });
});

describe("測試錯誤的 Email、Password 情境", () => {
  it("當 Email 沒有填寫時，跳出 Required 的錯誤訊息", async () => {
    const email = wrapper.getComponent('[data-test="email"]');
    await email.trigger('focus');
    await email.get('input').setValue('123'); //先隨便塞值
    await email.get('input').setValue('');
    await email.trigger('blur');
    const emailErrorMsg = email.get('.v-messages__message');
    expect(emailErrorMsg.text()).toEqual('Required');
  });

  it("當 Email 格式錯誤時，跳出相關錯誤訊息", async () => {
    const email = wrapper.getComponent('[data-test="email"]');
    await email.trigger('focus');
    await email.get('input').setValue('error');
    await email.trigger('blur');
    const emailErrorMsg = email.get('.v-messages__message');
    expect(emailErrorMsg.text()).toEqual('E-mail must be valid');
  });

  it("當 Password 沒有填寫時，跳出 Required 的錯誤訊息", async () => {
    const password = wrapper.getComponent('[data-test="password"]');
    await password.trigger('focus');
    await password.get('input').setValue('123'); //先隨便塞值
    await password.get('input').setValue('');
    await password.trigger('blur');
    const passwordErrorMsg = password.get('.v-messages__message');
    expect(passwordErrorMsg.text()).toEqual('Required');
  });

  it("當 Password 字數不滿 8 位時，跳出相關錯誤訊息", async () => {
    const password = wrapper.getComponent('[data-test="password"]');
    await password.trigger('focus');
    await password.get('input').setValue('less');
    await password.trigger('blur');
    const passwordErrorMsg = password.get('.v-messages__message');
    expect(passwordErrorMsg.text()).toEqual('Min 8 characters');
  });
});

describe("會讓元件屬性改變的行為", () => {
  it("當 Email、Password 未填寫時，登入按鈕為 Disabled", async () => {
    wrapper.vm.loadingResource = true;
    await wrapper.vm.$nextTick();
    const loginBtn = wrapper.get('[data-test="loginBtn"]');
    expect(loginBtn.attributes().disabled).toBeDefined();
  });
  it("當 Email、Password 格式錯誤時，登入按鈕為 Disabled", async () => {
    const formData = {
      email: "error",
      password: "less"
    };
    const email = wrapper.getComponent('[data-test="email"]');
    await email.trigger('focus');
    await email.get('input').setValue(formData.email);
    await email.trigger('blur');
    const password = wrapper.getComponent('[data-test="password"]');
    await password.trigger('focus');
    await password.get('input').setValue(formData.password);
    await password.trigger('blur');
    const loginBtn = wrapper.get('[data-test="loginBtn"]');
    expect(loginBtn.attributes().disabled).toBeDefined();
  });
  it("當 Email、Password 格式正確時，登入按鈕可點擊", async () => {
    const loginBtn = wrapper.get('[data-test="loginBtn"]');
    expect(loginBtn.attributes().disabled).toBeDefined();
    
    const formData = {
      email: "baoboa@mail.com",
      password: "baobaocute"
    };
    const email = wrapper.getComponent('[data-test="email"]');
    await email.trigger('focus');
    await email.get('input').setValue(formData.email);
    await email.trigger('blur');
    const password = wrapper.getComponent('[data-test="password"]');
    await password.trigger('focus');
    await password.get('input').setValue(formData.password);
    await password.trigger('blur');
    
    expect(loginBtn.attributes().disabled).toBeUndefined();
  });

  it("點擊顯示 Password 的 icon 時，type 會轉換成 text", async () => {
    const password = wrapper.getComponent('[data-test="password"]');
    const passwordAppendIcon = password.get('.v-icon--clickable');
    await passwordAppendIcon.trigger('click');
    expect(password.get('input').attributes().type).toBe("text");
  });
});

describe("登入功能", () => {
  it("輸入錯誤的帳號密碼，會彈出警視窗", async () => {
    const formData = {
      email: "err@mail.com",
      password: "errbaobao"
    };
    // 之所以要設計「focus、blur」就是為了模擬操作時會對元件狀態的改變
    const email = wrapper.getComponent('[data-test="email"]');
    await email.trigger('focus');
    await email.get('input').setValue(formData.email);
    await email.trigger('blur');
    const password = wrapper.getComponent('[data-test="password"]');
    await password.trigger('focus');
    await password.get('input').setValue(formData.password);
    await password.trigger('blur');
    const loginBtn = wrapper.get('[data-test="loginBtn"]');
    await loginBtn.trigger('click');
    const loginAlert = wrapper.get('[data-test="loginAlert"]');
    // 我們針對 Alert 是採用 v-show 的策略；只是想要隱藏，而非從 DOM 移除。
    // 因為這個元件真的存在，所以用 get/find 都能找到，需要使用 isVisible 來做進一步的確認
    expect(loginAlert.isVisible()).toBe(true)
  });
  it("確認 Router 可以順利導向", async () => {
    const formData = {
      email: "baoboa@mail.com",
      password: "baobaocute"
    };
    const email = wrapper.getComponent('[data-test="email"]');
    await email.trigger('focus');
    await email.get('input').setValue(formData.email);
    await email.trigger('blur');
    const password = wrapper.getComponent('[data-test="password"]');
    await password.trigger('focus');
    await password.get('input').setValue(formData.password);
    await password.trigger('blur');
    // 使用真實的 Router 測試時，若想要捕捉 Push 的行為，須透過 vi.spyOn 來模擬 router.push
    const spyPush = vi.spyOn(router, 'push');
    await wrapper.get('[data-test="loginBtn"]').trigger('click');
    expect(spyPush).toHaveBeenCalledTimes(1);
    expect(spyPush).toHaveBeenCalledWith('/home');
  });
});