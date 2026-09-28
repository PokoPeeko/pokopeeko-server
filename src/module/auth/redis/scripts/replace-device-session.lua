local previousId = redis.call('GET', KEYS[1])

if previousId then
  redis.call('DEL', 'session:' .. previousId)
end

redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[3])

return 1
