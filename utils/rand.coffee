
rand = module.exports =
   getRandomInt: (min, max) ->
      return Math.floor(Math.random() * (max - min) + min)

   getRandomInts: (count, max) ->
      nums = []
      while nums.length < count
         while true
            num = rand.getRandomInt(0, max)
            if not inList(num, nums)
               nums.push(num)
               break
      return nums

inList = (val, list) ->
   for i in list
      if i == val
         return true
   return false
