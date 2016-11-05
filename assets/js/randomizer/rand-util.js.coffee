do ->
   getRandomInt = (min, max) ->
      return Math.floor(Math.random() * (max - min) + min)

   getRandomInts = (count, max) ->
      nums = []
      count = max if count >= max

      while nums.length < count
         while true
            num = getRandomInt(0, max)
            if nums.indexOf(num) == -1
               nums.push(num)
               break
      return nums


   window.RandUtil = {
      getRandomInt: getRandomInt
      getRandomInts: getRandomInts
   }
