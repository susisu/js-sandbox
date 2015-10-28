(define (loop c n)
    (if (< c n) (loop (+ c 1) n) n)
)

(print (loop 0 100000))
