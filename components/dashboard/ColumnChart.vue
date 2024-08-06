<script setup lang="ts">
// ref: https://stackblitz.com/edit/nuxt-starter-mmn2ed?file=nuxt.config.ts,app.vue,plugins%2Fapexchart.client.ts

type ChartOptions = {
  chart: {
    type: string;
  };
  plotOptions: {
    bar: {
      borderRadius: number;
      borderRadiusApplication: string;
    };
  };
  xaxis?: {
    categories: (string | number)[];
  };
};

type SeriesData = {
  name: string;
  data: number[];
};

const options = ref<ChartOptions>({
  chart: {
    type: "bar",
  },
  plotOptions: {
    bar: {
      borderRadius: 5,
      borderRadiusApplication: "around",
    },
  },
});

const series = ref<SeriesData[]>([
  {
    name: "Score",
    data: [],
  },
]);

const updateChart = () => {
  //generate array of random numbers of length 10
  const data = Array.from({ length: 10 }, () =>
    Math.floor(Math.random() * 100),
  );
  options.value = {
    ...options.value,
    xaxis: {
      categories: Array.from(
        { length: 10 },
        (_, i) => new Date().getFullYear() - i,
      ),
    },
  };
  series.value = [
    {
      name: "Score",
      data: data,
    },
  ];
};

onMounted(() => {
  //generate array of random numbers of length 10
  setTimeout(() => {
    updateChart();
  }, 500);
});
</script>

<template>
  <h3 class="absolute left-4 top-3 text-2xl">API Usage</h3>
  <apexchart
    :key="series"
    height="100%"
    width="100%"
    :options="options"
    :series="series"
  ></apexchart>
</template>

<style>
.apexcharts-toolbar {
  display: none !important;
}
</style>
