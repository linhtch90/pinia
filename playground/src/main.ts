import { computed, createApp, markRaw } from 'vue'
import App from './App.vue'
import { acceptHMRUpdate, createPinia, isUseStore } from '../../src'
import { router } from './router'

const pinia = createPinia()

pinia.use(() => ({
  route: computed(() => markRaw(router.currentRoute.value)),
}))

if (import.meta.hot) {
  const stores = import.meta.glob('./stores/*.ts')
  for (const filePath in stores) {
    console.log('configuring HMR for', filePath)

    stores[filePath]().then((mod) => {
      for (const exportName in mod) {
        const storeDef = mod[exportName]
        if (isUseStore(storeDef)) {
          console.log(`Detected store "${storeDef.$id}"`)
          import.meta.hot!.accept(
            filePath,
            acceptHMRUpdate(storeDef, import.meta.hot)
          )
        }
      }
    })
  }

  //   const isUseStore = (fn: any): fn is StoreDefinition => {
  //     return typeof fn === 'function' && typeof fn.$id === 'string'
  //   }
  //   // import.meta.hot.accept(
  //   //   './stores/counter.ts',
  //   //   (newStore: Record<string, unknown>) => {
  //   //     console.log('haha', newStore)
  //   //   }
  //   // )
  //   import.meta.hot.accept('./test.ts', (newTest) => {
  //     console.log('test updated', newTest)
  //   })
  //   const stores = import.meta.glob('./stores/*.ts')
  //   for (const storeId in stores) {
  //     console.log('configuring HMR for', storeId)
  //     const oldUseStore = await stores[storeId]()
  //     console.log('got', oldUseStore)
  //     import.meta.hot!.accept(storeId, (newStore: Record<string, unknown>) => {
  //       console.log('Accepting update for', storeId)
  //       for (const exportName in newStore) {
  //         const useStore = newStore[exportName]
  //         if (isUseStore(useStore) && pinia._s.has(useStore.$id)) {
  //           const id = useStore.$id
  //           const existingStore = pinia._s.get(id)!
  //           // remove the existing store from the cache to force a new one
  //           pinia._s.delete(id)
  //           // this adds any new state to pinia and then runs the `hydrate` function
  //           // which, by default, will reuse the existing state in pinia
  //           const newStore = useStore(pinia)
  //           // pinia._s.set(id, existingStore)
  //         }
  //       }
  //     })
  //   }
}

createApp(App).use(router).use(pinia).mount('#app')
