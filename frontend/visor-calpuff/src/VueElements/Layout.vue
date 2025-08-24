<template>
  <div style="height: 100%;"> 
    <el-splitter>

      <el-splitter-panel size="35%" style="border-right:10px solid silver">

        <div id="vue-panel-table" class="box">
          <h5>Especies</h5>
          <h6>Fuentes Emisoras</h6>
        </div>
      
      </el-splitter-panel>

      <el-splitter-panel size="65%">

        <el-splitter layout="vertical">
          <el-splitter-panel size="65%" style="border-bottom:10px solid silver">
          <div
            id="vue-panel-map" 
            v-loading="loading" 
            element-loading-text="Cargando datos..."
            class="loading-wrapper" 
            element-loading-background="rgba(0, 0, 0, 0.7)"
          >
          </div>
          </el-splitter-panel>

          <el-splitter-panel size="35%">
          <div 
            id="vue-panel-serie"
            v-loading="loading2" 
            element-loading-text="Generando serie..."
            class="loading-wrapper"
            element-loading-background="rgba(0, 0, 0, 0.1)"
          >
          </div>
          </el-splitter-panel>
        </el-splitter>

      </el-splitter-panel>

    </el-splitter>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const loading = ref(false);
const loading2 = ref(false);
onMounted(() => {
  document.addEventListener('loading:start', () => loading.value = true);
  document.addEventListener('loading:end', () => loading.value = false);

  document.addEventListener('loading2:start', () => loading2.value = true);
  document.addEventListener('loading2:end', () => loading2.value = false);
});

</script>

<style scoped>
#vue-panel-map {
  height: 100%;
  background-color:  rgba(34, 34, 34, 1);
}
#vue-panel-serie {
  height: 100%;
  padding-top: 10px;
  padding-left: 25px;
  padding-right: 10px;
}
#vue-panel-table {
  height: 100%;
}

.box {
  display: flex;
  flex-direction: column;
}

/* ::v-deep se uiliza para componentes internos generados con vue */
::v-deep(.el-splitter-bar__collapse-icon) {
  opacity: 1;
  /* left: -5px; */
  top: -4px;
  width: 38px;
  height: 11px;
  border-radius: 5px;
  border: 1.5px solid rgb(118, 118, 118);
}
::v-deep(.el-splitter-bar__dragger) {
    opacity: 0;
}
</style>
