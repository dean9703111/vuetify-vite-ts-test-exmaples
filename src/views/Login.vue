<template>
  <div class="d-flex align-center flex-column">
    <v-card width="400">
      <v-container>
        <v-form v-model="valid" lazy-validation>
          <v-alert
            v-show="loginFail"
            type="error"
            class="mb-4"
            data-test="loginAlert"
          >
            You are entering an incorrect email and/or password.
          </v-alert>
          <v-text-field
            v-model="formData.email"
            :rules="emailRules"
            label="Email"
            required
            data-test="email"
          ></v-text-field>
          <v-text-field
            v-model="formData.password"
            :append-icon="pwShow ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required, rules.min]"
            :type="pwShow ? 'text' : 'password'"
            name="input-10-1"
            label="Password"
            hint="At least 8 characters"
            counter
            @click:append="pwShow = !pwShow"
            data-test="password"
          ></v-text-field>
          <v-spacer></v-spacer>
          <v-btn
            x-large
            block
            :disabled="!valid"
            color="success"
            @click="login"
            data-test="loginBtn"
          >
            Login
          </v-btn>
        </v-form>
      </v-container>
    </v-card>
  </div>
</template>
<script setup>
import { ref, reactive } from "vue";
import router from "@/router";
const valid = ref(true);
const pwShow = ref(false);
const loginFail = ref(false);
const formData = reactive({
  email: "",
  password: "",
});
const emailRules = [
  (v) => !!v || "Required",
  (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
];
const rules = {
  required: (value) => !!value || "Required",
  min: (v) => (v && v.length >= 8) || "Min 8 characters",
};
const login = () => {
  // 這邊只是為了方便理解，實際上應該要呼叫 api
  if ( formData.email === "baoboa@mail.com" && formData.password === "baobaocute") {
    router.push("/home");
  } else {
    loginFail.value = true;
  }
};
</script>